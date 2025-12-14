# Issue #001: Terraform State同期問題

## 発生日時
2025-12-14

## 症状
GitHub Actionsでの`terraform apply`が「リソースが既に存在する」エラーで失敗

```
Error: creating CloudWatch Logs Log Group: ResourceAlreadyExistsException
Error: creating AWS DynamoDB Table: ResourceInUseException
Error: creating IAM Role: EntityAlreadyExists
```

## 原因

### 根本原因
Terraform Stateがローカルにのみ保存されており、GitHub Actionsと共有されていなかった。

### 発生の経緯

1. 初回デプロイ（GitHub Actions）でAWSリソースが作成された
2. Stateはローカルに保存（`backend.tf`がコメントアウト状態）
3. 2回目のデプロイでGitHub Actionsは新規stateとして扱い、既存リソースの作成を試みた
4. 「リソースが既に存在する」エラーが発生

### 追加の問題
- `terraform apply`実行中の強制終了により、一部リソースがAWSに作成されたがstateに反映されなかった
- stateとAWSの実態が不一致となり、手動でのimportが必要になった

## 解決策

### 実施した対応

1. **S3バックエンドの設定**
   - S3バケット作成: `inquiry-system-tfstate-552927148143`
   - DynamoDBロックテーブル作成: `terraform-lock`
   - `backend.tf`を有効化

2. **既存リソースのimport**
   ```bash
   terraform import module.dynamodb.aws_dynamodb_table.inquiry inquiry-table-dev
   terraform import module.lambda.aws_iam_role.lambda upload-inquiry-dev-role
   # ... 他のリソース
   ```

3. **全リソースの再作成**
   ```bash
   terraform destroy -auto-approve
   terraform apply -auto-approve
   ```

4. **GitHub Actionsの削除**
   - ローカル運用に切り替えたため不要

## 今後の対策

### 必須対策

1. **プロジェクト開始時にS3バックエンドを設定する**
   ```hcl
   terraform {
     backend "s3" {
       bucket         = "project-tfstate-bucket"
       key            = "env/dev/terraform.tfstate"
       region         = "ap-northeast-1"
       encrypt        = true
       dynamodb_table = "terraform-lock"
     }
   }
   ```

2. **`terraform apply`は途中で強制終了しない**
   - 強制終了するとstateが破損する可能性がある
   - 中断が必要な場合は完了を待つか、`Ctrl+C`で正常停止

3. **CI/CDを使う場合は初期設定をローカルで完了させてからpush**
   - S3バックエンド設定
   - `terraform init`
   - 初回`terraform apply`

### 推奨対策

1. **state lockを有効にする**（DynamoDB使用）
2. **state暗号化を有効にする**（`encrypt = true`）
3. **定期的な`terraform plan`でdriftを検知**

## 関連リソース

- S3バケット: `inquiry-system-tfstate-552927148143`
- DynamoDBロックテーブル: `terraform-lock`
- 設定ファイル: `infrastructure/environments/dev/backend.tf`
