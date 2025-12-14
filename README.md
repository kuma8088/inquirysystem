# Inquiry System

予約サイトのユーザーからの問い合わせを受け付けるサーバレスアプリケーション。
Amazon Bedrockを活用した自動分類・回答生成機能を搭載し、非同期処理とメール通知を実装。

## アーキテクチャ

```
[問い合わせ登録 + 非同期処理]
User → API Gateway → upload-inquiry Lambda → DynamoDB
                            ↓
                          SQS (inquiry-queue)
                            ↓
                     execute-job Lambda
                            ↓
                      Step Functions
                       ↓         ↓
               JudgeCategory    [category == "質問"?]
                                      ↓ Yes
                                CreateAnswer (Bedrock + S3 RAG)
                                      ↓
                                send-email (SES)

[日次集計]
EventBridge (0:00 JST) → daily-aggregation Lambda → DynamoDB GSI → S3
```

## 機能

| 機能 | 説明 |
|------|------|
| 問い合わせ登録 | API経由でユーザーからの問い合わせを受付 |
| 非同期処理 | SQS + Step Functionsによる信頼性の高い処理 |
| 自動分類 | AIが問い合わせを5カテゴリに分類 |
| 自動回答生成 | RAGデータを参照してAIが回答を生成（質問のみ） |
| メール通知 | 回答生成後にSESでユーザーにメール送信 |
| 日次集計 | EventBridgeで毎日0時にカテゴリ別集計を実行 |

### 分類カテゴリ

- 質問
- 改善要望
- ポジティブな感想
- ネガティブな感想
- その他

## ディレクトリ構成

```
inquirysystem/
├── infrastructure/              # Terraform
│   ├── environments/
│   │   └── dev/                # 開発環境
│   └── modules/
│       ├── api-gateway/        # API Gateway
│       ├── lambda/             # upload-inquiry Lambda
│       ├── dynamodb/           # DynamoDB (GSI含む)
│       ├── s3-rag/             # S3 RAGデータ
│       ├── s3-aggregation/     # S3 集計結果
│       ├── sqs/                # SQS キュー
│       ├── ses/                # SES メール
│       ├── step-functions/     # Step Functions
│       ├── lambda-bedrock/     # Bedrock Lambda
│       ├── lambda-ses/         # send-email Lambda
│       ├── lambda-sqs-sfn/     # execute-job Lambda
│       └── eventbridge-lambda/ # daily-aggregation Lambda
├── src/
│   ├── functions/
│   │   ├── upload-inquiry/     # 問い合わせ登録 + SQS送信
│   │   ├── judge-category/     # AI分類
│   │   ├── create-answer/      # AI回答生成
│   │   ├── execute-job/        # SQS → Step Functions起動
│   │   ├── send-email/         # SES メール送信
│   │   └── daily-aggregation/  # 日次集計
│   └── rag-data/
│       └── hotel_info.json     # RAGデータ（ホテル情報）
└── docs/
    ├── issues/                 # トラブルシューティング記録
    └── requirement03.md        # 非同期処理・集計・メール要件
```

## セットアップ

### 前提条件

- Python 3.12
- Terraform 1.6+
- AWS CLI (設定済み)

### インフラのデプロイ

```bash
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

## API

### POST /inquiry

問い合わせを送信します。

**エンドポイント:**
```
https://{api-id}.execute-api.ap-northeast-1.amazonaws.com/inquiry
```

**リクエスト:**
```json
{
  "reviewText": "問い合わせの内容",
  "userName": "投稿者名",
  "mailAddress": "mail@example.com"
}
```

**レスポンス:**

| StatusCode | 説明 |
|------------|------|
| 200 | 正常 |
| 400 | パラメータエラー |
| 500 | 内部エラー |

```json
{
  "message": "Inquiry submitted successfully",
  "id": "uuid"
}
```

## Lambda関数

| 関数名 | トリガー | 役割 |
|--------|----------|------|
| upload-inquiry-dev | API Gateway | 問い合わせ登録 + SQS送信 |
| execute-job-dev | SQS | Step Functions起動 |
| judge-category-dev | Step Functions | AI分類 |
| create-answer-dev | Step Functions | AI回答生成 |
| send-email-dev | Step Functions | メール送信 |
| daily-aggregation-dev | EventBridge | 日次集計 |

### 手動実行例

```bash
# 日次集計を手動実行
aws lambda invoke --function-name daily-aggregation-dev response.json
cat response.json
```

## Step Functions ワークフロー

```
inquiry-workflow-dev

StartAt: JudgeCategory
         ↓
    JudgeCategory (Lambda)
         ↓
    CheckIfQuestion (Choice)
    ├─ category == "質問" → CreateAnswer → SendEmail → End
    └─ else → SkipProcessing → End
```

**処理フロー:**
1. JudgeCategory: 問い合わせをAIで5カテゴリに分類
2. CheckIfQuestion: カテゴリが「質問」かチェック
3. CreateAnswer: 「質問」の場合のみRAGデータを参照してAI回答生成
4. SendEmail: 回答をユーザーにメール送信

## DynamoDBスキーマ

| 属性 | 型 | 説明 |
|------|-----|------|
| id | String (PK) | UUID |
| reviewText | String | 問い合わせ内容 |
| userName | String | 投稿者名 |
| mailAddress | String | メールアドレス |
| createdDate | String | 作成日 (YYYY-MM-DD, JST) |
| Category | String | AI分類結果 |
| answer | String | AI生成回答（質問のみ） |

### Global Secondary Index

| インデックス名 | Hash Key | 用途 |
|---------------|----------|------|
| createdDate-index | createdDate | 日次集計用 |

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| IaC | Terraform |
| API | API Gateway (HTTP API) |
| Compute | AWS Lambda (Python 3.12) |
| Database | DynamoDB |
| Storage | S3 |
| AI | Amazon Bedrock (Nova Micro) |
| Messaging | Amazon SQS |
| Orchestration | AWS Step Functions |
| Email | Amazon SES |
| Scheduling | Amazon EventBridge |

## Terraform State管理

S3バックエンドを使用してstateを管理しています。

- バケット: `inquiry-system-tfstate-552927148143`
- ロックテーブル: `terraform-lock`

## 既知の課題・改善予定

### SES メール配信

現在、SESはサンドボックスモードで個別のメールアドレス検証を使用しています。
Gmail同士の送受信では迷惑メールに分類される場合があります。

**迷惑メール対策オプション:**

| 優先度 | 対策 | コスト | 効果 |
|-------|------|-------|------|
| 1 | From表示名追加 | 無料・コード修正のみ | 中 |
| 2 | 独自ドメイン + DKIM/SPF/DMARC | ドメイン費用 | 高 |
| 3 | サンドボックス解除申請 | 無料・AWS申請 | - |

**From表示名の実装例:**
```python
# 現在
Source='sender@example.com'

# 改善後
Source='サンプルホテル東京 <sender@example.com>'
```

**ドメイン認証:**
- SPF: 送信元IPの正当性を証明
- DKIM: メール改ざんがないことを証明
- DMARC: SPF/DKIMの検証ポリシーを公開

**参考:**
- [SES ドメイン検証](https://docs.aws.amazon.com/ses/latest/dg/creating-identities.html#verify-domain-procedure)
- [メール認証設定](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication.html)
