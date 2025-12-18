---
title: "E2Eテストが17件通るのに本番で「Unknown error」が出た話"
emoji: "🎭"
type: "tech"
topics: ["playwright", "vite", "e2eテスト", "環境変数", "react"]
published: false
published_at: 2025-12-19 12:00
---

E2Eテスト17件、すべてグリーン。

「よし、完璧」

Claude Code でフロントエンド実装からE2Eテストまで、驚くほどスムーズに進んでいた。React コンポーネント、API クライアント、Playwright テスト。AIエージェントが次々とコードを生成し、テストも一発でパス。

「AIすごいな」と感心しながら、S3にデプロイ。本番サイトを開いてフォームを送信したら——

「Unknown error」

「え？」

ブラウザのキャッシュをクリアした。変わらない。ハードリフレッシュした。変わらない。

「デバッグして」と指示。AIがコードを調査し、あれこれ修正を提案してくる。試す。直らない。10分経過。

「もう一回E2Eテスト回して」と指示。数十秒後、17件すべてグリーン。

「テスト通ってるじゃん...なんで本番で動かないの？」

イライラが募る。テストは通る。でも本番は動かない。AIに何度聞いても、的確な答えが返ってこない。

結局、自分でブラウザの開発者ツールを開き、ネットワークタブを睨み、`console.log(import.meta.env)` を叩いて、ようやく気づいた。

**APIエンドポイントが `undefined` になっている。**

ここから原因を辿って、解決まで約30分。技術的には単純な問題だったが、「テストは通るのに」という状況が判断を鈍らせた。

原因は「Viteの環境変数」と「Playwrightの設定」という、2つの意外なところにあった。

---

## こんな状況になっていませんか？

- E2Eテストは全部通るのに、本番で動かない
- 「昨日まで動いてたのに...」と頭を抱えている
- ググっても同じ症状が見つからない
- Claude にも Gemini にも聞いたけど、的外れな回答ばかり
- AI のサジェスト通りにしたら、むしろ悪化した

この記事は、そんなあなたのための記事です。

---

## 先に結論

**2つの問題が複合していた:**

1. **Vite は `npm run build` 時に `.env.production` を読む**。`.env.development` しかないと環境変数が空になる
2. **Playwright の `webServer` 設定が常に開発サーバーを起動する**ため、本番ビルドがテストされていなかった

つまり、**E2Eテストは本番ビルドをテストしていなかった**。

---

## 環境

| 項目 | バージョン |
|:---|:---|
| Vite | 7.x |
| Playwright | 1.57 |
| React | 19.x |
| ホスティング | AWS S3 静的ウェブサイト |

---

## 症状

本番環境でフォームを送信すると、こんなエラーが表示される:

```
Unknown error
再試行
```

開発者ツールを開いて `console.log(import.meta.env.VITE_API_ENDPOINT)` を確認したら、`undefined` だった。

「は？ちゃんと設定したのに？」

---

## 原因

### なぜ環境変数が空になるのか

プロジェクトのファイル構成はこうなっていた:

```
.env.development  ← npm run dev で使用 ✅
.env.production   ← npm run build で使用 ❌ 存在しない
```

Vite は `npm run build` 実行時に `.env.production` を読み込む。このファイルがないと、`VITE_*` で始まる環境変数はすべて空になる。

| コマンド | 読み込まれるファイル |
|:---|:---|
| `npm run dev` | `.env.development` |
| `npm run build` | `.env.production` |
| `npm run preview` | `.env.production` |

「`.env.development` にちゃんと書いてあるのに...」と思っていたが、**ビルド時には読まれていなかった**。

### なぜE2Eテストで検出できなかったのか

これが本当の罠だった。

```typescript
// playwright.config.ts（問題のあった設定）
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

`BASE_URL` を本番URLに設定しても、`webServer` 設定が開発サーバーを起動してしまう。結果、`.env.development` が読み込まれ、正しいAPI設定でテストが通ってしまう。

```
[期待していた動作]
npm run test:e2e:prod
    ↓
本番S3サイトをテスト
    ↓
API設定なし → エラー → テスト失敗 ✅

[実際の動作]
npm run test:e2e:prod
    ↓
webServer が開発サーバーを起動
    ↓
.env.development が読み込まれる
    ↓
API設定あり → 成功 → テスト成功（誤検出）❌
```

「テストが通った」≠「本番で動く」ということを、身をもって学んだ。

---

## 解決策

### 1. ビルド時に環境変数を指定

```bash
VITE_API_ENDPOINT=https://xxx.execute-api.ap-northeast-1.amazonaws.com npm run build
```

または `.env.production` を作成:

```bash
# .env.production
VITE_API_ENDPOINT=https://xxx.execute-api.ap-northeast-1.amazonaws.com
```

### 2. playwright.config.ts を修正

`BASE_URL` が設定されている場合は、開発サーバーを起動しないようにする:

```typescript
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
  },
  webServer: process.env.BASE_URL
    ? undefined  // 本番テスト時は起動しない
    : {
        command: 'npm run dev',
        port: 5173,
      },
})
```

### 3. 本番テスト用スクリプトを追加

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:prod": "BASE_URL=https://your-app.example.com playwright test"
  }
}
```

---

## 予防策

### ローカルで本番ビルドを確認する

```bash
npm run build
npm run preview  # .env.production を使ってプレビュー
```

### ビルド結果に環境変数が含まれているか確認

```bash
grep -o 'https://[^"]*execute-api[^"]*' dist/assets/*.js
# APIエンドポイントが出力されればOK
```

### CI/CDで本番テストを追加

```yaml
# デプロイ後に本番環境でスモークテスト
- run: npm run test:e2e:prod
```

---

## 学び

| 学び | 内容 |
|:---|:---|
| Viteの環境変数 | `dev` と `build` で読み込むファイルが違う |
| E2Eテストの落とし穴 | `webServer` が便利すぎて本番をテストし忘れる |
| テストの原則 | 「テストが通った」≠「本番で動く」 |
| AIとの付き合い方 | 最後は自分の目で確認する習慣が大事 |

AIエージェントは本当に優秀で、今回もフロントエンド実装の大半を任せられた。でも、「テストが通っているのに本番で動かない」という状況では、AIも同じ罠にハマる。テストを回せば通る。だから「問題ない」と判断してしまう。

結局、**自分でブラウザの開発者ツールを開いて、自分の目で確認する**ことで原因が分かった。

AIに任せきりにせず、デプロイ後は自分で本番環境を触る。この習慣が、30分のデバッグを5分に縮められたかもしれない。

本番ビルドを実際にテストするパイプラインを組まないと、この手の問題は検出できない。

---

## 関連リポジトリ

この記事で紹介した設定は、以下のリポジトリで実際に使用しています。

https://github.com/kuma8088/inquirysystem

## 参考

- [Vite 環境変数とモード](https://ja.vitejs.dev/guide/env-and-mode.html)
- [Playwright webServer設定](https://playwright.dev/docs/test-webserver)
