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

[分析環境]
DynamoDB → Glue Job (PySpark) → S3 (Parquet) → Athena
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
| 分析環境 | Glue + Athenaで本番DBに負荷をかけずにSQLクエリ |

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
│       ├── s3-analytics/       # S3 分析データ (Glue出力)
│       ├── sqs/                # SQS キュー
│       ├── ses/                # SES メール
│       ├── step-functions/     # Step Functions
│       ├── lambda-bedrock/     # Bedrock Lambda
│       ├── lambda-ses/         # send-email Lambda
│       ├── lambda-sqs-sfn/     # execute-job Lambda
│       ├── eventbridge-lambda/ # daily-aggregation Lambda
│       ├── glue-etl/           # Glue Job (DynamoDB → S3)
│       └── athena/             # Athena Workgroup
├── src/
│   ├── functions/
│   │   ├── upload-inquiry/     # 問い合わせ登録 + SQS送信
│   │   ├── judge-category/     # AI分類
│   │   ├── create-answer/      # AI回答生成
│   │   ├── execute-job/        # SQS → Step Functions起動
│   │   ├── send-email/         # SES メール送信
│   │   └── daily-aggregation/  # 日次集計
│   ├── glue/
│   │   └── dynamodb_to_s3.py   # Glue ETLスクリプト
│   └── rag-data/
│       └── hotel_info.json     # RAGデータ（ホテル情報）
└── docs/
    ├── issues/                 # トラブルシューティング記録
    ├── requirement03.md        # 非同期処理・集計・メール要件
    └── requirement04.md        # 分析環境要件
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

![Step Functions Workflow](docs/images/step_function.png)

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

## 分析環境 (Glue + Athena)

本番DynamoDBに負荷をかけずにデータ分析を行うための環境。

### アーキテクチャ

```
DynamoDB (inquiry-table-dev)
        ↓
    AWS Glue Job (dynamodb-to-s3-etl-dev)
    - PySpark ETL
    - throughput 50%制限で本番負荷軽減
        ↓
    S3 Bucket (inquiry-analytics-dev)
    - Parquet形式 (SNAPPY圧縮)
    - パーティション: year/month/day
    - 30日で自動削除
        ↓
    Glue Data Catalog
    - Database: inquiry_analytics_dev
    - Table: inquiry
        ↓
    Athena Workgroup (inquiry-analytics-dev)
    - SQLクエリ実行
    - スキャン上限: 10GB
```

### 使用方法

```bash
# 1. Glue Job手動実行（データエクスポート）
aws glue start-job-run --job-name dynamodb-to-s3-etl-dev

# 2. 実行状態確認
aws glue get-job-runs --job-name dynamodb-to-s3-etl-dev --max-items 1

# 3. パーティション登録（初回または新パーティション追加時）
aws athena start-query-execution \
  --query-string "MSCK REPAIR TABLE inquiry" \
  --work-group inquiry-analytics-dev \
  --query-execution-context Database=inquiry_analytics_dev

# 4. Athenaクエリ実行
aws athena start-query-execution \
  --query-string "SELECT category, COUNT(*) FROM inquiry GROUP BY category" \
  --work-group inquiry-analytics-dev \
  --query-execution-context Database=inquiry_analytics_dev
```

### 保存済みクエリ

| クエリ名 | 説明 |
|----------|------|
| category-summary | カテゴリ別問い合わせ件数 |
| daily-trend | 日別問い合わせ推移 |
| all-data | 全データ取得 (LIMIT 100) |

### コスト見積もり（月額）

| サービス | 想定使用量 | コスト |
|---------|-----------|-------|
| Glue Job | 月4回 x 2DPU x 2分 | ~$0.15 |
| S3 Storage | ~10MB (Parquet) | ~$0.01 |
| Athena | ~1GB スキャン | ~$0.005 |
| **合計** | | **~$0.20/月** |

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
| ETL | AWS Glue (PySpark) |
| Analytics | Amazon Athena |

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

## 補足

### 非同期処理のメリット

本システムでは SQS + Step Functions による非同期処理を採用しています。

#### 1. 障害の分離（Fault Isolation）

```
[同期処理の場合]
API → Lambda → Bedrock → SES → レスポンス
       ↑
   どこか1つ失敗 → 全体が失敗、ユーザーにエラー

[非同期処理の場合]
API → Lambda → DynamoDB → SQS → レスポンス（即座に200 OK）
                           ↓
                    Step Functions（後で処理）
```

- ユーザーへの応答が高速化（Bedrock/SES の完了を待たない）
- Bedrock障害時でもデータは保存済み（後でリトライ可能）

#### 2. 自動リトライ（SQSの特性）

```
SQS → Lambda失敗 → メッセージがキューに戻る → 再試行
                   ↓
              3回失敗 → DLQ（Dead Letter Queue）へ
```

- 一時的な障害（ネットワーク、Bedrockの過負荷）を自動で乗り越える
- 失敗したメッセージは消えない（DLQで調査・再処理可能）

#### 3. スケーラビリティ

```
[同期処理]
大量リクエスト → Lambda同時実行上限 → スロットリング → エラー

[非同期処理]
大量リクエスト → SQSに蓄積 → Lambdaが順次処理 → 全て成功
```

- SQSがバッファとして機能（ピークを吸収）
- 処理速度を超えるリクエストも取りこぼさない

#### 4. Step Functionsの可視化・制御

- 処理フローが可視化される（デバッグ容易）
- 各ステップで個別にリトライ設定可能
- 実行履歴から成功/失敗、各ステップの入出力を確認可能

#### 具体的なシナリオ比較

| シナリオ | 同期だと... | 非同期だと... |
|---------|------------|--------------|
| Bedrock応答遅延 | ユーザー30秒待機 | 即座に200 OK、裏で処理 |
| SES一時障害 | メール送信失敗、データロスト | SQSで保持、復旧後に自動送信 |
| 大量問い合わせ | Lambda上限でエラー | キューに蓄積、順次処理 |

### サーバーレスの優位性

本システムをオンプレミスやIaaS（EC2等）で構築した場合との比較。

#### 構成比較

```
[サーバーレス構成（本システム）]
API Gateway → Lambda → DynamoDB → SQS → Step Functions
                                         ↓
                                   Lambda (Bedrock/SES)

[従来構成（オンプレ/IaaS）]
ロードバランサー → Webサーバー群 → アプリサーバー群 → RDB
     ↓                                    ↓
  冗長化構成                         メッセージキュー
  (2台以上)                          (RabbitMQ等)
                                          ↓
                                    ワーカーサーバー群
```

#### メリット

| 観点 | サーバーレス | オンプレ/IaaS |
|------|-------------|--------------|
| **初期コスト** | ほぼゼロ | サーバー購入/構築費用 |
| **運用コスト** | 従量課金（使った分だけ） | 24時間稼働費用（アイドル時も課金） |
| **インフラ保守** | AWS管理（パッチ適用不要） | 自前でOS/ミドルウェア更新 |
| **スケーリング** | 自動（設定不要） | 手動または自動スケール設定が必要 |
| **可用性** | マネージドで高可用性 | 冗長構成を自前で設計・構築 |
| **障害対応** | AWS側で自動復旧 | 監視・アラート・復旧手順が必要 |
| **開発速度** | ビジネスロジックに集中 | インフラ構築に時間を要する |

#### コスト試算例（月間1,000リクエスト想定）

| 項目 | サーバーレス | EC2構成（最小冗長化） |
|------|-------------|---------------------|
| コンピュート | Lambda: ~$0.20 | EC2 t3.small x2: ~$30 |
| データベース | DynamoDB: ~$1 | RDS t3.micro: ~$15 |
| メッセージング | SQS: ~$0.01 | EC2 + RabbitMQ: ~$15 |
| ロードバランサー | API Gateway: ~$1 | ALB: ~$20 |
| **合計** | **~$2/月** | **~$80/月** |

※低トラフィック時はサーバーレスが圧倒的に有利

#### デメリット・考慮点

| 観点 | 課題 | 対策・備考 |
|------|------|-----------|
| **コールドスタート** | 初回起動に数百ms〜数秒 | Provisioned Concurrencyで軽減可能 |
| **実行時間制限** | Lambda最大15分 | 長時間処理はStep Functionsで分割 |
| **ベンダーロックイン** | AWS依存が高まる | マルチクラウド要件があれば要検討 |
| **デバッグ難易度** | ローカル再現が困難 | SAM/LocalStack等で軽減 |
| **ステートレス制約** | Lambda間で状態共有不可 | DynamoDB/S3で状態管理 |
| **コスト予測** | 従量課金で変動 | 高トラフィック時はEC2が有利な場合も |

#### 本システムに適している理由

1. **トラフィック変動** - 問い合わせは不定期、アイドル時間が長い
2. **処理単位が明確** - 1リクエスト = 1処理で分離しやすい
3. **スパイク対応** - キャンペーン等の急増にも自動対応
4. **小規模スタート** - 初期投資なしで始められる
5. **運用負荷軽減** - インフラ専任なしでも運用可能

### サーバーレスからIaaSへの移行判断基準

ビジネス成長に伴い、サーバーレスからIaaS（EC2等）への移行を検討するタイミング。

#### コストの損益分岐点

```
        コスト
          ↑
          │      ／ Lambda（従量課金）
          │    ／
          │  ／
          │／───────── EC2（固定費）
          │
          └──────────────→ リクエスト数
               ↑
            損益分岐点（月100万リクエスト付近）
```

| 月間リクエスト | Lambda | EC2 (t3.medium) | 判定 |
|---------------|--------|-----------------|------|
| ~10万 | ~$5 | ~$30 | Lambda有利 |
| ~100万 | ~$50 | ~$30 | 同等 |
| 1,000万~ | ~$500+ | ~$50-100 | EC2有利 |

#### 移行判断の基準

| 基準 | サーバーレス継続 | IaaS移行検討 |
|------|-----------------|-------------|
| **月間コスト** | ~$100以下 | $500超が継続 |
| **トラフィック** | 変動が大きい | 常時高負荷（予測可能） |
| **レイテンシ要件** | 数百ms許容 | 10ms以下必須 |
| **実行時間** | 15分以内 | 長時間バッチ処理 |

#### 段階的アプローチ（推奨）

```
Phase 1: フルサーバーレス（本システム）
    ↓ 月100万リクエスト超
Phase 2: ハイブリッド（高頻度処理のみコンテナ化）
    ↓ さらに拡大
Phase 3: ECS/EKS（コンテナオーケストレーション）
```

#### 現実的な視点

- **月100万リクエスト以上** = ビジネスとして十分な収益が見込める段階
- その時点でインフラ投資・運用体制の強化は現実的な選択肢
- **逆に言えば、月100万リクエストまではサーバーレスで十分対応可能**
- 多くのスタートアップ・中小規模サービスはサーバーレスの適用範囲内

#### 結論

「まずサーバーレスで始める」戦略は合理的：

1. **初期投資ゼロ**でビジネス検証が可能
2. **月100万リクエストまで**はコスト優位性を維持
3. **移行が必要になる頃**にはビジネス収益でインフラ投資が可能
4. **全移行ではなくハイブリッド**から段階的に最適化
