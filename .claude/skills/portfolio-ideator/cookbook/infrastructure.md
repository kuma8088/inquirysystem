# インフラ系ポートフォリオ

AWS/Terraform/Linux/ネットワーク系ポートフォリオの追加観点。

## 追加調査項目

Web検索で以下を追加調査：
- 「AWS infrastructure portfolio github」
- 「Terraform project examples」
- 「SRE portfolio projects」

## インフラ系の評価軸

| 軸 | 観点 | 重要度 |
|:---|:---|:---:|
| **本番想定** | 実運用を意識した設計か | ⚠️ 高 |
| **IaC 完成度** | 全リソースがコード化されているか | ⚠️ 高 |
| **セキュリティ** | 最低限のセキュリティ対策があるか | ⚠️ 高 |
| **コスト意識** | 月額概算を示せるか | 中 |
| **ドキュメント** | 設計意図が説明されているか | 中 |

## 推奨プロジェクトパターン

### パターン1: 3層アーキテクチャ

```
CloudFront → ALB → ECS/EC2 → RDS
```

**証明できるスキル:**
- VPC 設計（Public/Private Subnet）
- セキュリティグループ設計
- Auto Scaling
- RDS Multi-AZ

### パターン2: サーバーレス構成

```
API Gateway → Lambda → DynamoDB
     ↓
   Cognito（認証）
```

**証明できるスキル:**
- サーバーレスアーキテクチャ
- IAM ポリシー設計
- イベント駆動設計

### パターン3: マルチ環境 IaC

```
terraform/
├── environments/
│   ├── dev/
│   ├── stg/
│   └── prod/
└── modules/
    ├── networking/
    ├── compute/
    └── database/
```

**証明できるスキル:**
- Terraform モジュール設計
- 環境分離
- 変数管理

### パターン4: 監視・運用基盤

```
CloudWatch → SNS → Lambda → Slack
    ↓
CloudWatch Logs → Subscription Filter → OpenSearch
```

**証明できるスキル:**
- 可観測性（Observability）
- アラート設計
- ログ集約

## Naoya のスキル活用

| 保有スキル | 推奨プロジェクト |
|:---|:---|
| LPIC1/2/303 | Linux hardening 自動化、パフォーマンスチューニング |
| AWS SAA | Well-Architected レビュー自動化ツール |
| CCNA | VPC 設計テンプレート、Transit Gateway 構成 |
| Terraform | マルチアカウント・マルチリージョン構成 |

## GitHub README 必須項目

```markdown
# Project Name

## Architecture
[draw.io/Mermaid で作成した図]

## Features
- [ ] Feature 1
- [ ] Feature 2

## Prerequisites
- Terraform >= 1.x
- AWS CLI configured
- AWS Account

## Quick Start
1. `terraform init`
2. `terraform plan`
3. `terraform apply`

## Cost Estimate
| Resource | Monthly Cost |
|:---|---:|
| EC2 | $XX |
| RDS | $XX |
| **Total** | **$XX** |

## Security Considerations
- [考慮点1]
- [考慮点2]

## Future Improvements
- [ ] 改善点1
- [ ] 改善点2
```

## 差別化ポイント

❌ 避けるべき:
- 単純な EC2 + RDS 構成（ありふれている）
- チュートリアルのコピー
- README が空

✅ 目指すべき:
- 実運用を想定した設計（障害対応、スケーリング）
- コスト最適化の工夫
- セキュリティ対策の明記
- 設計判断の理由を文書化
