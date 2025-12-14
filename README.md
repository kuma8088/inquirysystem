# Inquiry System

予約サイトのユーザーからの問い合わせを受け付けるサーバレスアプリケーション。

## アーキテクチャ

```
User → API Gateway → Lambda (upload-inquiry-dev) → DynamoDB (inquiry-table-dev)
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
│       └── upload-inquiry/ # Lambda関数 (Python)
└── docs/
    └── issues/             # トラブルシューティング記録
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

## Terraform State管理

S3バックエンドを使用してstateを管理しています。

- バケット: `inquiry-system-tfstate-552927148143`
- ロックテーブル: `terraform-lock`
