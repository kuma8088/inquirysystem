# DevOps 系ポートフォリオ

CI/CD・自動化・運用系ポートフォリオの追加観点。

## 追加調査項目

Web検索で以下を追加調査：
- 「DevOps portfolio projects github」
- 「CI/CD pipeline examples」
- 「GitOps implementation」

## DevOps 系の評価軸

| 軸 | 観点 | 重要度 |
|:---|:---|:---:|
| **自動化度** | 手作業を排除しているか | ⚠️ 高 |
| **再現性** | 誰でも同じ結果を得られるか | ⚠️ 高 |
| **ドキュメント** | 設計意図が説明されているか | ⚠️ 高 |
| **セキュリティ** | シークレット管理、権限設計 | 中 |
| **可観測性** | ログ・メトリクス・トレース | 中 |

## 推奨プロジェクトパターン

### パターン1: CI/CD パイプライン

```
GitHub Actions
    ↓
  Build → Test → Security Scan
    ↓
  Terraform Plan → Apply
    ↓
  ECS Deploy
```

**証明できるスキル:**
- CI/CD 設計
- IaC 自動化
- セキュリティスキャン統合

### パターン2: GitOps 構成

```
Git Repository (定義)
    ↓
  ArgoCD / Flux
    ↓
  Kubernetes Cluster
```

**証明できるスキル:**
- GitOps 原則
- Kubernetes 運用
- 宣言的インフラ

### パターン3: 監視・アラート基盤

```
Application → CloudWatch Metrics
    ↓
  CloudWatch Alarms → SNS → Lambda
    ↓
  Slack / PagerDuty
```

**証明できるスキル:**
- 可観測性設計
- インシデント対応自動化
- SLO/SLI 設計

### パターン4: Infrastructure as Code 完全自動化

```
Terraform Cloud / Atlantis
    ↓
  PR → Plan → Review → Apply
    ↓
  State 管理 (S3 + DynamoDB)
```

**証明できるスキル:**
- Terraform ワークフロー
- チーム開発プロセス
- State 管理ベストプラクティス

## Naoya のスキル活用

| 既存スキル | DevOps での活用 |
|:---|:---|
| LPIC1/2/303 | Linux 運用自動化、シェルスクリプト |
| AWS SAA | AWS サービス連携、IAM 設計 |
| CCNA | ネットワーク監視、VPC フローログ分析 |
| Terraform | IaC パイプライン構築 |

## GitHub Actions テンプレート

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Tests
        run: |
          # テスト実行

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Security Scan
        uses: aquasecurity/trivy-action@master

  terraform:
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - name: Terraform Plan
        run: |
          terraform init
          terraform plan

  deploy:
    needs: terraform
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to ECS
        run: |
          # デプロイ処理
```

## GitHub README 必須項目

```markdown
# Project Name

## Overview
[何を自動化するか]

## Architecture
[パイプライン図]

## Features
- ✅ Automated testing
- ✅ Security scanning
- ✅ Infrastructure as Code
- ✅ Zero-downtime deployment

## Prerequisites
- AWS Account
- GitHub Account
- Terraform >= 1.x

## Setup
1. Fork this repository
2. Configure secrets
3. Run pipeline

## Pipeline Stages
| Stage | Description | Duration |
|:---|:---|:---|
| Test | Unit/Integration tests | ~2min |
| Security | Trivy scan | ~1min |
| Plan | Terraform plan | ~1min |
| Deploy | ECS update | ~5min |

## Security
- Secrets stored in GitHub Secrets / AWS Secrets Manager
- IAM roles follow least privilege principle
- Security scanning on every PR

## Monitoring
[監視・アラートの説明]
```

## 差別化ポイント

❌ 避けるべき:
- Hello World のデプロイだけ
- セキュリティ考慮なし
- ドキュメントなし

✅ 目指すべき:
- 本番運用を想定した設計
- セキュリティスキャン統合
- ロールバック戦略
- 監視・アラート込み
