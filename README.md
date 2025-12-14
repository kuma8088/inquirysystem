# Inquiry System

予約サイトのユーザーからの問い合わせを受け付けるサーバレスアプリケーション。
Amazon Bedrockを活用した自動分類・回答生成機能を搭載。

## アーキテクチャ

```
[問い合わせ登録]
User → API Gateway → Lambda (upload-inquiry) → DynamoDB

[AI分類]
JudgeCategory Lambda ← id → DynamoDB (Category追加)
        ↓
   Bedrock (Nova Micro)

[AI回答生成]
CreateAnswer Lambda ← id → DynamoDB (answer追加)
        ↓
   Bedrock (Nova Micro) + S3 (RAGデータ)
```

## 機能

| 機能 | 説明 |
|------|------|
| 問い合わせ登録 | API経由でユーザーからの問い合わせを受付 |
| 自動分類 | AIが問い合わせを5カテゴリに分類 |
| 自動回答生成 | RAGデータを参照してAIが回答を生成 |

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
│       ├── api-gateway/        # API Gateway モジュール
│       ├── lambda/             # Lambda モジュール
│       ├── dynamodb/           # DynamoDB モジュール
│       ├── s3-rag/             # S3 RAGデータ モジュール
│       └── lambda-bedrock/     # Bedrock Lambda モジュール
├── src/
│   ├── functions/
│   │   ├── upload-inquiry/     # 問い合わせ登録 Lambda
│   │   ├── judge-category/     # 分類 Lambda
│   │   └── create-answer/      # 回答生成 Lambda
│   └── rag-data/
│       └── hotel_info.json     # RAGデータ（ホテル情報）
└── docs/
    └── issues/                 # トラブルシューティング記録
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

### judge-category-dev

問い合わせをAIで分類します。

```bash
aws lambda invoke --function-name judge-category-dev \
  --payload '{"id": "問い合わせID"}' \
  --cli-binary-format raw-in-base64-out response.json
```

### create-answer-dev

RAGデータを参照してAI回答を生成します。

```bash
aws lambda invoke --function-name create-answer-dev \
  --payload '{"id": "問い合わせID"}' \
  --cli-binary-format raw-in-base64-out response.json
```

## DynamoDBスキーマ

| 属性 | 型 | 説明 |
|------|-----|------|
| id | String (PK) | UUID |
| reviewText | String | 問い合わせ内容 |
| userName | String | 投稿者名 |
| mailAddress | String | メールアドレス |
| Category | String | AI分類結果 |
| answer | String | AI生成回答 |

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| IaC | Terraform |
| API | API Gateway (HTTP API) |
| Compute | AWS Lambda (Python 3.12) |
| Database | DynamoDB |
| Storage | S3 |
| AI | Amazon Bedrock (Nova Micro) |

## Terraform State管理

S3バックエンドを使用してstateを管理しています。

- バケット: `inquiry-system-tfstate-552927148143`
- ロックテーブル: `terraform-lock`
