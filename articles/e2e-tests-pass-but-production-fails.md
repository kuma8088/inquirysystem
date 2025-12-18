---
title: "E2Eテストは成功するのに本番環境で動かない？Vite + Playwrightの落とし穴"
emoji: "🎭"
type: "tech"
topics: ["playwright", "vite", "e2e", "環境変数", "テスト"]
published: false
published_at: 2025-12-19 12:00
---

17件のE2Eテストがすべてグリーン。安心してデプロイしたら、本番環境でフォーム送信が動かない。ブラウザのコンソールを見ると「Unknown error」。

この記事では、Vite + Playwrightの構成で陥りやすい環境変数の罠と、本番環境を正しくテストする方法を解説します。

## 症状

- Playwright E2Eテスト: 17件すべて成功 ✅
- 本番環境（S3静的ホスティング）: フォーム送信で「Unknown error」❌

ブラウザの開発者ツールで確認すると、APIエンドポイントが空文字列になっていました。

```javascript
// 期待値
console.log(import.meta.env.VITE_API_ENDPOINT)
// → "https://xxx.execute-api.ap-northeast-1.amazonaws.com"

// 実際の値
// → undefined
```

API自体は正常に動作している（curlで確認済み）。ということは、フロントエンドのビルドに問題がある。

## 原因：2つの問題が複合していた

### 問題1: `.env.production` が存在しない

```
frontend/
├── .env.development  ← npm run dev で使用 ✅
└── .env.production   ← npm run build で使用 ❌ ファイルがない！
```

Viteは `npm run build` 実行時に `.env.production` を読み込みます。このファイルがなかったため、`VITE_API_ENDPOINT` が空のままビルドされていました。

**Viteの環境変数読み込みルール:**

| コマンド | 読み込まれるファイル |
|:---|:---|
| `npm run dev` | `.env.development` |
| `npm run build` | `.env.production` |
| `npm run preview` | `.env.production` |

### 問題2: E2Eテストが本番ビルドをテストしていなかった

```typescript
// playwright.config.ts（修正前）
export default defineConfig({
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',  // 常に開発サーバーを起動
    port: 5173,
  },
})
```

`BASE_URL` 環境変数を渡して本番URLをテストしようとしても、`webServer` 設定があるため開発サーバーが起動してしまいます。結果、`.env.development` が読み込まれ、テストは成功。

```
[期待していた動作]
BASE_URL=本番URL npm run test:e2e
    ↓
本番サイトをテスト → API設定なし → テスト失敗

[実際の動作]
BASE_URL=本番URL npm run test:e2e
    ↓
webServer により開発サーバーが起動
    ↓
.env.development が読み込まれる
    ↓
API設定あり → テスト成功（偽陽性）
```

## 解決策

### 1. ビルド時に環境変数を指定

**方法A: コマンドラインで指定（CI/CD向け）**

```bash
VITE_API_ENDPOINT=https://xxx.execute-api.ap-northeast-1.amazonaws.com npm run build
```

**方法B: `.env.production` を作成（ローカル開発向け）**

```bash
# .env.production
VITE_API_ENDPOINT=https://xxx.execute-api.ap-northeast-1.amazonaws.com
```

### 2. playwright.config.ts を修正

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
  },
  // BASE_URL が設定されている場合は開発サーバーを起動しない
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
      },
})
```

ポイントは `webServer` を条件付きにしたこと。`BASE_URL` が指定されていれば、外部URLに対してテストを実行します。

### 3. npm scripts を追加

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:prod": "BASE_URL=https://your-production-url.com playwright test"
  }
}
```

**使い分け:**

| スクリプト | テスト対象 | 用途 |
|:---|:---|:---|
| `npm run test:e2e` | 開発サーバー | 日常の開発 |
| `npm run test:e2e:prod` | 本番URL | デプロイ後の検証 |

## CI/CDでの推奨フロー

```yaml
# GitHub Actions
jobs:
  build-and-deploy:
    steps:
      # 環境変数を指定してビルド
      - run: VITE_API_ENDPOINT=${{ secrets.API_ENDPOINT }} npm run build

      # S3へデプロイ
      - run: aws s3 sync dist/ s3://your-bucket --delete

      # 本番環境でのスモークテスト
      - run: BASE_URL=${{ vars.PRODUCTION_URL }} npm run test:e2e
```

ビルド → デプロイ → 本番E2Eテストの順で実行することで、「テストは通るのに本番で動かない」を防げます。

## 学び

### E2Eテストは「何をテストしているか」を意識する

- 開発サーバーのテスト ≠ 本番ビルドのテスト
- `webServer` 設定の便利さが裏目に出ることがある
- 本番環境に対するテストを別途用意する

### 環境変数はビルド時に静的埋め込みされる

Viteの `import.meta.env.VITE_*` はビルド時に値が決まります。ランタイムで変更はできません。

```javascript
// ビルド後のコード（イメージ）
const apiEndpoint = "";  // ビルド時に空だったのでそのまま埋め込まれる
```

### ローカルで本番ビルドを確認する方法

```bash
# 本番ビルドを作成
VITE_API_ENDPOINT=https://xxx npm run build

# プレビューサーバーで確認
npm run preview
```

`npm run preview` は `.env.production` を使ってビルドされたファイルを配信するので、本番に近い状態を確認できます。

## まとめ

| 問題 | 解決策 |
|:---|:---|
| `.env.production` がない | ファイル作成 or ビルド時に環境変数指定 |
| E2Eが本番をテストしていない | `webServer` を条件付きに変更 |

「テストが通った = 本番で動く」ではありません。本番環境に対するE2Eテストを明示的に用意することで、この種の問題を早期発見できます。

---

## 関連リポジトリ

この記事で紹介した設定は、以下のリポジトリで実際に使用しています。

https://github.com/kuma8088/inquirysystem

## 参考リンク

- [Vite 環境変数とモード](https://ja.vitejs.dev/guide/env-and-mode.html)
- [Playwright webServer設定](https://playwright.dev/docs/test-webserver)
