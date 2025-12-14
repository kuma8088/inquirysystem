# 002: Bedrock チャットボット機能実装

## 概要

問い合わせシステムにAmazon Bedrockベースの自動回答・分類機能を追加。

## 実装日

2024-12-14

## 追加機能

### 1. JudgeCategory Lambda

問い合わせ内容をAI（Nova Micro）で自動分類する。

**分類カテゴリ:**
- 質問
- 改善要望
- ポジティブな感想
- ネガティブな感想
- その他

**使用方法:**
```bash
aws lambda invoke --function-name judge-category-dev \
  --payload '{"id": "問い合わせID"}' \
  --cli-binary-format raw-in-base64-out response.json
```

### 2. CreateAnswer Lambda

RAGデータ（ホテル情報）を参照して、問い合わせに対する回答を自動生成する。

**使用方法:**
```bash
aws lambda invoke --function-name create-answer-dev \
  --payload '{"id": "問い合わせID"}' \
  --cli-binary-format raw-in-base64-out response.json
```

## アーキテクチャ

```
既存フロー:
User → API Gateway → upload-inquiry Lambda → DynamoDB

追加フロー:
JudgeCategory Lambda ← id → DynamoDB (Category追加)
        ↓
   Bedrock (Nova Micro)

CreateAnswer Lambda ← id → DynamoDB (answer追加)
        ↓
   Bedrock (Nova Micro) + S3 (RAGデータ)
```

## 新規作成リソース

### Terraformモジュール

| モジュール | 説明 |
|-----------|------|
| `modules/s3-rag` | RAGデータ用S3バケット |
| `modules/lambda-bedrock` | Bedrock連携Lambda用モジュール |

### Lambda関数

| 関数名 | 説明 | タイムアウト | メモリ |
|--------|------|-------------|--------|
| judge-category-dev | 問い合わせ分類 | 60秒 | 256MB |
| create-answer-dev | 回答生成 | 120秒 | 256MB |

### その他

| リソース | 名前 | 説明 |
|----------|------|------|
| S3バケット | inquiry-rag-data-dev | ホテル情報JSONを格納 |

## 技術的な詳細

### Bedrock モデル

- **モデル**: Amazon Nova Micro
- **Inference Profile**: `apac.amazon.nova-micro-v1:0`
- **理由**: 低コスト、テキスト処理に最適化

### RAGデータ

`src/rag-data/hotel_info.json` にホテル情報を格納:
- 基本情報（名称、住所、電話番号）
- チェックイン/アウト時間
- 施設情報
- 料金
- アクセス
- よくある質問

### IAMポリシー

Bedrock Inference Profileはクロスリージョンでルーティングするため、以下の権限が必要:

```hcl
resources = [
  "arn:aws:bedrock:${region}:${account_id}:inference-profile/apac.amazon.nova-micro-v1:0",
  "arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0"
]
```

## 発生した問題と解決

### 問題1: モデルアクセスエラー

**エラー:**
```
Invocation of model ID amazon.nova-micro-v1:0 with on-demand throughput isn't supported.
```

**原因:**
Amazon Nova Microはon-demandではなく、Inference Profileを使用する必要がある。

**解決:**
- `bedrock_model_id` を `amazon.nova-micro-v1:0` から `apac.amazon.nova-micro-v1:0` に変更

### 問題2: クロスリージョンアクセス拒否

**エラー:**
```
AccessDeniedException: User is not authorized to perform: bedrock:InvokeModel on resource: arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-micro-v1:0
```

**原因:**
APAC Inference Profileは複数リージョン（ap-northeast-1, ap-southeast-2等）にルーティングするが、IAMポリシーがap-northeast-1のみ許可していた。

**解決:**
- IAMポリシーに `arn:aws:bedrock:*::foundation-model/amazon.nova-micro-v1:0` を追加

## DynamoDB スキーマ更新

問い合わせテーブルに以下の属性が追加される:

| 属性名 | 型 | 説明 | 追加タイミング |
|--------|-----|------|---------------|
| Category | String | 分類カテゴリ | JudgeCategory実行時 |
| answer | String | AI生成回答 | CreateAnswer実行時 |

## テスト結果

```bash
# 1. 問い合わせ登録
curl -X POST https://hhzmeeanrb.execute-api.ap-northeast-1.amazonaws.com/inquiry \
  -d '{"reviewText": "チェックインは何時からですか？", ...}'
# → ID: 9b6ce5d6-1065-453d-bf3f-40b55b77777f

# 2. カテゴリ分類
aws lambda invoke --function-name judge-category-dev --payload '{"id": "..."}'
# → Category: "質問"

# 3. 回答生成
aws lambda invoke --function-name create-answer-dev --payload '{"id": "..."}'
# → answer: "チェックイン時間は15:00から..."

# 4. DynamoDB確認
aws dynamodb get-item --table-name inquiry-table-dev --key '{"id": {"S": "..."}}'
# → Category と answer が正しく保存されていることを確認
```

## コスト

- **固定費**: 0円（サーバレス構成）
- **従量課金**:
  - Nova Micro: $0.035/100万入力トークン, $0.14/100万出力トークン
  - S3: ほぼ無料（数KB程度のJSON）
  - Lambda: 無料枠内で収まる想定

## 関連ファイル

```
src/
├── rag-data/
│   └── hotel_info.json          # RAGデータ
└── functions/
    ├── create-answer/
    │   └── lambda_function.py   # 回答生成Lambda
    └── judge-category/
        └── lambda_function.py   # 分類Lambda

infrastructure/modules/
├── s3-rag/                      # S3モジュール
└── lambda-bedrock/              # Bedrock Lambda モジュール
```
