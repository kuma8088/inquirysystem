# Inquiry System

予約サイトのユーザーからの問い合わせを受け付けるサーバレスアプリケーション。
Amazon Bedrockを活用した自動分類・回答生成機能を搭載し、非同期処理とメール通知を実装。

## アーキテクチャ

### システム全体図

```
[フロントエンド]
React SPA (S3 Static Website) → CloudFront (オプション)

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
├── frontend/                   # フロントエンド (React + Vite)
│   ├── src/
│   │   ├── api/               # API クライアント
│   │   ├── components/        # React コンポーネント
│   │   │   ├── common/       # 共通コンポーネント (Button, Input, etc)
│   │   │   ├── inquiry/      # 問い合わせ関連 (Form, List, Detail)
│   │   │   └── layout/       # レイアウト
│   │   ├── hooks/            # カスタムフック
│   │   ├── pages/            # ページコンポーネント
│   │   ├── providers/        # Context Provider
│   │   ├── types/            # TypeScript型定義
│   │   └── utils/            # ユーティリティ関数
│   ├── e2e/                  # E2Eテスト (Playwright)
│   ├── .env.development      # 開発環境変数
│   ├── .env.example          # 環境変数テンプレート
│   ├── playwright.config.ts  # Playwright設定
│   ├── vite.config.ts        # Vite設定
│   └── package.json
├── infrastructure/             # Terraform
│   ├── environments/
│   │   └── dev/              # 開発環境
│   └── modules/
│       ├── api-gateway/      # API Gateway
│       ├── lambda/           # upload-inquiry Lambda
│       ├── dynamodb/         # DynamoDB (GSI含む)
│       ├── s3-rag/           # S3 RAGデータ
│       ├── s3-aggregation/   # S3 集計結果
│       ├── s3-analytics/     # S3 分析データ (Glue出力)
│       ├── s3-frontend/      # S3 静的ウェブサイトホスティング
│       ├── sqs/              # SQS キュー
│       ├── ses/              # SES メール
│       ├── step-functions/   # Step Functions
│       ├── lambda-bedrock/   # Bedrock Lambda
│       ├── lambda-ses/       # send-email Lambda
│       ├── lambda-sqs-sfn/   # execute-job Lambda
│       ├── eventbridge-lambda/ # daily-aggregation Lambda
│       ├── glue-etl/         # Glue Job (DynamoDB → S3)
│       └── athena/           # Athena Workgroup
├── src/
│   ├── functions/
│   │   ├── upload-inquiry/   # 問い合わせ登録 + SQS送信
│   │   ├── judge-category/   # AI分類
│   │   ├── create-answer/    # AI回答生成
│   │   ├── execute-job/      # SQS → Step Functions起動
│   │   ├── send-email/       # SES メール送信
│   │   └── daily-aggregation/ # 日次集計
│   ├── glue/
│   │   └── dynamodb_to_s3.py # Glue ETLスクリプト
│   └── rag-data/
│       └── hotel_info.json   # RAGデータ（ホテル情報）
└── docs/
    ├── blog-articles/         # 技術記事・詰まりログ
    ├── issues/               # トラブルシューティング記録
    ├── requirement03.md      # 非同期処理・集計・メール要件
    └── requirement04.md      # 分析環境要件
```

## セットアップ

### 前提条件

- Python 3.12
- Terraform 1.6+
- AWS CLI (設定済み)
- Node.js 20+ (フロントエンド開発用)
- npm または yarn

### バックエンドのデプロイ

```bash
cd infrastructure/environments/dev
terraform init
terraform plan
terraform apply
```

### フロントエンドのセットアップ

#### 1. 依存関係のインストール

```bash
cd frontend
npm install
```

#### 2. 環境変数の設定

`.env.development` ファイルを作成し、APIエンドポイントを設定します。

```bash
# .env.development
VITE_API_ENDPOINT=https://{api-id}.execute-api.ap-northeast-1.amazonaws.com
```

**参考:** `.env.example` にテンプレートがあります。

#### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

#### 4. ビルド（本番用）

```bash
# 環境変数を指定してビルド
VITE_API_ENDPOINT=https://{api-id}.execute-api.ap-northeast-1.amazonaws.com npm run build

# または .env.production を作成してからビルド
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

#### 5. S3へのデプロイ

```bash
aws s3 sync dist/ s3://inquiry-frontend-dev --delete
```

**アクセスURL:**
```
http://inquiry-frontend-dev.s3-website-ap-northeast-1.amazonaws.com
```

### フロントエンドのテスト

#### 単体テスト（Vitest）

```bash
# テスト実行（ウォッチモード）
npm run test

# テスト実行（1回のみ）
npm run test:run

# カバレッジ付き
npm run test:coverage
```

#### E2Eテスト（Playwright）

```bash
# 開発サーバーでE2Eテスト
npm run test:e2e

# UIモード（デバッグ用）
npm run test:e2e:ui

# ヘッドモード（ブラウザを表示）
npm run test:e2e:headed

# 本番環境でE2Eテスト（S3デプロイ後）
npm run test:e2e:prod
```

**重要:** 本番環境のE2Eテストは、S3へのデプロイ後に実行してください。

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

### フロントエンド

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| フレームワーク | React | 19.2 |
| ビルドツール | Vite | 7.2 |
| 言語 | TypeScript | 5.9 |
| スタイリング | Tailwind CSS | 4.1 |
| 状態管理 | React Query | 5.90 |
| フォーム管理 | React Hook Form | 7.68 |
| バリデーション | Zod | 4.2 |
| ルーティング | React Router | 7.10 |
| 単体テスト | Vitest | 4.0 |
| E2Eテスト | Playwright | 1.57 |
| ホスティング | AWS S3 静的ウェブサイト | - |

### バックエンド

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

### アーキテクチャパターン

- **フロントエンド:** SPA (Single Page Application)
- **バックエンド:** サーバーレス + 非同期処理
- **データフロー:** Event-Driven Architecture (EDA)

## Terraform State管理

S3バックエンドを使用してstateを管理しています。

- バケット: `inquiry-system-tfstate-552927148143`
- ロックテーブル: `terraform-lock`

## トラブルシューティング

### フロントエンド関連

#### 問題: 本番環境でフォーム送信すると「Unknown error」が発生

**症状:**
- E2Eテストは成功するが、S3にデプロイした本番環境ではエラーが発生
- ブラウザの開発者ツールで `VITE_API_ENDPOINT` が `undefined` になっている

**原因:**
- `.env.production` が存在しないか、ビルド時に環境変数が指定されていない
- Viteは `npm run build` 実行時に `.env.production` を読み込む

**解決策:**

```bash
# 方法1: ビルド時に環境変数を指定
VITE_API_ENDPOINT=https://{api-id}.execute-api.ap-northeast-1.amazonaws.com npm run build

# 方法2: .env.production を作成
echo "VITE_API_ENDPOINT=https://{api-id}.execute-api.ap-northeast-1.amazonaws.com" > .env.production
npm run build
```

**詳細:** [詰まりログ: E2Eテストは成功するのに本番環境でエラーが発生する問題](/docs/blog-articles/001_e2e-tests-pass-but-production-fails.md)

#### 問題: E2Eテストで本番ビルドがテストされていない

**症状:**
- `npm run test:e2e:prod` を実行しても、常に開発サーバーが起動する

**原因:**
- `playwright.config.ts` の `webServer` 設定が常に有効になっている

**解決策:**

`playwright.config.ts` を以下のように修正（修正済み）:

```typescript
webServer: process.env.BASE_URL
  ? undefined  // BASE_URL が設定されている場合は開発サーバーを起動しない
  : {
      command: 'npm run dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    }
```

### バックエンド関連

その他のトラブルシューティングは `/docs/issues/` を参照してください。

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
