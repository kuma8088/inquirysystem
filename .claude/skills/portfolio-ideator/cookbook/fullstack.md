# フルスタック系ポートフォリオ

Web アプリケーション開発系ポートフォリオの追加観点。

## 追加調査項目

Web検索で以下を追加調査：
- 「fullstack portfolio projects 2024」
- 「React Next.js portfolio github」
- 「indie hacker side project」

## フルスタック系の評価軸

| 軸 | 観点 | 重要度 |
|:---|:---|:---:|
| **実用性** | 実際に使える機能があるか | ⚠️ 高 |
| **UI/UX** | 見た目と使いやすさ | ⚠️ 高 |
| **デプロイ** | 本番環境で動作しているか | ⚠️ 高 |
| **コード品質** | 読みやすく保守しやすいか | 中 |
| **テスト** | 最低限のテストがあるか | 中 |

## 推奨技術スタック

### フロントエンド

| 技術 | 用途 | 学習コスト |
|:---|:---|:---:|
| Next.js | SSR/SSG、フルスタック | 中 |
| React | SPA | 低〜中 |
| Tailwind CSS | スタイリング | 低 |
| shadcn/ui | コンポーネント | 低 |

### バックエンド

| 技術 | 用途 | 学習コスト |
|:---|:---|:---:|
| Next.js API Routes | 軽量 API | 低 |
| Node.js + Express | REST API | 低 |
| Python + FastAPI | API + データ処理 | 中 |

### インフラ（Naoya の強み活用）

| 技術 | 用途 |
|:---|:---|
| Terraform | インフラ構築 |
| AWS (ECS/Lambda) | ホスティング |
| Vercel/Amplify | 簡易デプロイ |

## 推奨プロジェクトパターン

### パターン1: SaaS MVP

```
Next.js → API Routes → PostgreSQL
    ↓
  Stripe（決済）
  Clerk/Auth.js（認証）
```

**証明できるスキル:**
- フルスタック開発
- 認証・認可
- 決済連携

### パターン2: 内部ツール

```
React Dashboard → REST API → DynamoDB
    ↓
  Cognito（社内認証）
```

**証明できるスキル:**
- 業務アプリ開発
- データ可視化
- AWS 連携

### パターン3: AI 統合アプリ

```
Next.js → OpenAI/Claude API → S3（履歴保存）
```

**証明できるスキル:**
- AI API 活用
- プロンプトエンジニアリング
- コスト管理

## Naoya のスキル活用

| 既存スキル | フルスタックでの活用 |
|:---|:---|
| AWS SAA | 本番環境のインフラ設計 |
| Terraform | インフラのコード化（差別化ポイント） |
| ネットワーク | セキュリティ設計、VPC 構成 |

**差別化戦略:**
> 「フロントエンドだけでなく、本番運用を見据えたインフラまで一貫して構築できる」

## デプロイ先の選択

| サービス | 向いているケース | コスト |
|:---|:---|:---|
| Vercel | Next.js、素早くデプロイ | 無料〜 |
| AWS Amplify | AWS 連携が必要 | 無料〜 |
| ECS + ALB | 本格運用、Terraform 管理 | $30〜/月 |

## GitHub README 必須項目

```markdown
# Project Name

## Demo
[デプロイ済み URL]

## Screenshots
[スクリーンショット]

## Features
- ✅ Feature 1
- ✅ Feature 2

## Tech Stack
- Frontend: Next.js, Tailwind CSS
- Backend: API Routes, PostgreSQL
- Infrastructure: Terraform, AWS

## Getting Started

### Prerequisites
- Node.js >= 18
- AWS Account (optional)

### Local Development
```bash
npm install
npm run dev
```

## Architecture
[図]

## Lessons Learned
[学んだこと、工夫した点]
```

## 差別化ポイント

❌ 避けるべき:
- Todo アプリ（世界に100万個ある）
- チュートリアルのコピー
- デプロイされていない

✅ 目指すべき:
- 実際に使えるツール
- 本番デプロイ済み
- インフラまで含めた構成（Terraform）
- 明確な問題解決
