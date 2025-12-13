# Inquiry System

予約サイトのユーザーからの問い合わせを受け付けるサーバレスアプリケーション。

## アーキテクチャ

```
User → API Gateway → Lambda (UploadInquiry) → DynamoDB (InquiryTable)
```

## ディレクトリ構成

```
inquirysystem/
├── infrastructure/          # Terraform
│   ├── environments/
│   │   └── dev/            # 開発環境
│   └── modules/
│       ├── api-gateway/    # API Gateway モジュール
│       ├── lambda/         # Lambda モジュール
│       └── dynamodb/       # DynamoDB モジュール
├── src/
│   └── functions/
│       └── upload-inquiry/ # Lambda関数
└── .github/
    └── workflows/          # CI/CD
```

## セットアップ

### 前提条件

- Node.js 20.x
- Terraform 1.6+
- AWS CLI (設定済み)

### Lambda関数のビルド

```bash
cd src/functions/upload-inquiry
npm install
npm run build
```

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
