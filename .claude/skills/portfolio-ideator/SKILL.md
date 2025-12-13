---
name: portfolio-ideator
description: グローバル市場調査に基づき、価値の高いポートフォリオプロジェクトを発見・計画・実装ガイドするスキル。「何を作るべき？」でアイデア発見、Business Roadmap Advisorの出力を参照してポートフォリオ連携、個別プロジェクトの実装計画（Terraform/AWS）を提示。マーケティングと技術の両面からアドバイス。
---

# Portfolio Ideator v2.0

グローバル需要のある、差別化された、個人で実装可能なポートフォリオプロジェクトを発見し、実装まで導く。

## スキル連携

### freelance-validator からの引き継ぎ

```
freelance-validator で 🟢 Do it / 🟡 Maybe 判定
    ↓
「このアイデアをポートフォリオ化して」
    ↓
portfolio-ideator が判定結果を読み込み
    ↓
事業に直結するポートフォリオを提案
```

**引き継ぎ時の確認事項:**
- 事業タイプ（SaaS / コンサル / コンテンツ / 受託開発）
- 評価結果（7軸の星評価）
- 強化すべきポイント

---

## 動作モード

### Mode 1: Discovery（アイデア発見）

**トリガー:** 「何を作るべき？」「ポートフォリオのアイデアが欲しい」

**Step 1: ポートフォリオタイプの特定**

| タイプ | 条件 | 参照ファイル |
|:---|:---|:---|
| インフラ | AWS/Terraform/ネットワーク系 | `cookbook/infrastructure.md` |
| フルスタック | Web アプリ開発 | `cookbook/fullstack.md` |
| DevOps | CI/CD/自動化系 | `cookbook/devops.md` |
| コンテンツ | 技術発信・記事・登壇 | `cookbook/content.md` |

**Step 2: 調査プロセス（Web検索必須）**

1. グローバルトレンド分析
   - 「[技術] jobs site:linkedin.com」
   - 「[技術] hiring site:upwork.com」

2. 課題発見
   - 「I wish someone would build site:reddit.com」
   - 「frustrating site:news.ycombinator.com」

3. 競合分析
   - 既存ソリューションの評価
   - 成功しているインディーハッカーの調査

**出力:**
```
## 🎯 Portfolio Project Idea

### Project Name
[キャッチーな名前]

### One-Liner
[一文で説明]

### The Problem (with evidence)
- [課題1] - Source: [URL]
- [課題2] - Source: [URL]

### Why NOW
[なぜ今やるべきか]

### Target Audience
[誰が使うか]

### Skill Fit（既存スキル活用度）
| 保有スキル | 活用度 | 活用方法 |
|:---|:---:|:---|
| LPIC1/2/303 | ⭐⭐⭐☆☆ | [具体的な活用] |
| AWS SAA | ⭐⭐⭐☆☆ | [具体的な活用] |
| CCNA | ⭐⭐⭐☆☆ | [具体的な活用] |
| Terraform | ⭐⭐⭐☆☆ | [具体的な活用] |

### Tech Stack
| Layer | Technology | Why |
|:---|:---|:---|
| IaC | Terraform | [理由] |
| Cloud | AWS | [理由] |

### MVP Scope (2-4 weeks)
[最小限の実装範囲]

### Career Impact
- Skills demonstrated: [リスト]
- Job roles this opens: [リスト]

### Monetization Path
[収益化の可能性]

### 🔗 次のステップ
- **実装計画**: 「[プロジェクト名]の実装計画を」
- **事業評価**: 「freelance-validatorでこのアイデアを評価して」
```

---

### Mode 2: Alignment（ロードマップ連携）

**トリガー:** 「ロードマップに合わせてポートフォリオ更新」「Business Roadmap Advisorの計画を参照して」

**プロセス:**
1. Business Roadmap Advisor の出力を読み込み
2. ビジネス目標とポートフォリオの紐付け
3. スキルギャップを埋めるプロジェクト特定
4. 収益目標に直結するプロジェクトを優先

**出力:**
```
## 📊 Portfolio-Roadmap Alignment

### Current Roadmap Goals
[Business Roadmap Advisorから引用]

### Portfolio Mapping
| Q | Business Goal | Portfolio Project | Skills Demonstrated |
|:---|:---|:---|:---|
| Q1 | [目標] | [プロジェクト] | [スキル] |
| Q2 | [目標] | [プロジェクト] | [スキル] |

### Skill Gap Analysis
| 目標達成に必要 | 現状 | ギャップを埋めるプロジェクト |
|:---|:---|:---|
| [スキル] | [レベル] | [プロジェクト提案] |

### Recommended Sequence
1. [プロジェクト1] - [理由]
2. [プロジェクト2] - [理由]
```

---

### Mode 3: Execution（実装計画）

**トリガー:** 「[プロジェクト名]の実装計画を」「これをどう作る？」

**前提環境:**
- IDE: VS Code + Claude Code
- IaC: Terraform
- Cloud: AWS（ap-northeast-1）
- VCS: Git/GitHub

**出力:**
```
## 🛠️ Implementation Plan: [Project Name]

### Overview
- Goal: [何を証明するか]
- Time: [X weeks]
- Complexity: [Beginner/Intermediate/Advanced]
- Estimated Cost: [AWS月額概算]

### Architecture
[draw.io または Mermaid で図を生成]

### Directory Structure
```
project-name/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   └── prod/
│   ├── modules/
│   └── main.tf
├── docs/
├── scripts/
└── README.md
```

### Phase 1: Foundation (Day 1-3)
- [ ] VPC + Subnet構築 (2h)
- [ ] Security Group設定 (1h)
- [ ] IAM Role作成 (1h)

**Checkpoint:** terraform plan 成功

### Phase 2: Core (Day 4-7)
- [ ] [コアリソース] (Xh)

**Checkpoint:** 主要機能が動作

### Phase 3: Polish (Day 8-10)
- [ ] README.md（アーキテクチャ図含む）
- [ ] コスト見積もりドキュメント
- [ ] デモ準備

**Checkpoint:** GitHub公開 ready

### Common Pitfalls
| Issue | Solution |
|:---|:---|
| [エラー1] | [対処法] |

### Portfolio Presentation
- GitHub README必須項目
- 記事化の切り口
- LinkedIn投稿フック

### 🔗 連携スキル
- **terraform-aws**: 「このプロジェクトのTerraformを書いて」
- **creating-drawio**: 「アーキテクチャ図を作成して」
- **technical-blog-writer**: 「このプロジェクトを記事化して」
```

---

## 既存スキルマッピング

ユーザーの保有スキルとポートフォリオの相性：

| 保有資格/経験 | 相性の良いポートフォリオ |
|:---|:---|
| **LPIC1/2/303** | Linux パフォーマンスチューニング、セキュリティ hardening |
| **AWS SAA** | Well-Architected 準拠構成、コスト最適化事例 |
| **CCNA** | ネットワーク設計、VPC/Transit Gateway 構成 |
| **Terraform** | IaC ベストプラクティス、マルチ環境構成 |
| **ネットワーク営業経験** | 技術とビジネスを橋渡しするドキュメント |

---

## 評価基準（全モード共通）

| 基準 | 問い |
|:---|:---|
| Market Value | グローバルで雇用価値が上がるか？ |
| Demand Evidence | 求人・投稿で需要を証明できるか？ |
| Solo Feasibility | 1人で2-4週間でMVP可能か？ |
| Differentiation | 1000個のTodoアプリと何が違う？ |
| Skill Fit | 既存スキルとの相乗効果あるか？ |
| Monetization | プロダクト化の可能性は？ |

## コミュニケーションスタイル

- 意見を持つ：10個の凡庸なアイデアより1-3個の強い推奨
- 根拠を示す：検索結果とURLで裏付け
- チュートリアルレベルは却下：印象に残るプロジェクトを推す
- Executionモードでは極めて具体的かつ実行可能に
