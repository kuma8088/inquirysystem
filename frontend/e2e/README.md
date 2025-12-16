# E2Eテスト実行ガイド

## 概要

Playwrightを使用した問い合わせシステムのE2Eテストです。

## テストファイル

- `inquiry-form.spec.ts`: 問い合わせフォームの送信、バリデーション、永続化のテスト
- `navigation.spec.ts`: ページ遷移、ヘッダーナビゲーション、404ページのテスト

## 実行方法

### 1. ヘッドレスモード（CI/自動テスト向け）

```bash
npm run test:e2e
```

開発サーバーが自動的に起動され、テストが実行されます。

### 2. UIモード（対話的なデバッグ）

```bash
npm run test:e2e:ui
```

Playwrightの便利なUIが起動し、テストの実行状況を視覚的に確認できます。

### 3. ヘッドモード（ブラウザを表示）

```bash
npm run test:e2e:headed
```

実際のブラウザウィンドウを開いてテストを実行します。

### 4. デバッグモード

```bash
npm run test:e2e:debug
```

ステップ実行でテストをデバッグできます。

## テスト対象

### 問い合わせフォーム (`inquiry-form.spec.ts`)

- [ ] フォームが正しく表示される
- [ ] 正しく入力して送信すると詳細ページに遷移する
- [ ] 空のフォームを送信するとバリデーションエラーが表示される
- [ ] 不正なメールアドレスでバリデーションエラーが表示される
- [ ] 入力したメールアドレスがローカルストレージに保存される
- [ ] 送信中は送信ボタンが無効化される
- [ ] 入力値の最大文字数制限

### ナビゲーション (`navigation.spec.ts`)

- [ ] ホームページからヘッダーリンクで各ページに遷移できる
- [ ] ロゴクリックでホームページに戻る
- [ ] 存在しないページにアクセスすると404ページが表示される
- [ ] 404ページからホームページに戻れる
- [ ] ブラウザの戻るボタンで前のページに戻れる
- [ ] ブラウザの進むボタンで次のページに進める
- [ ] 履歴ページで問い合わせ一覧が表示される
- [ ] ヘッダーは全ページで表示される
- [ ] 404ページでもヘッダーは表示される
- [ ] 直接URLで問い合わせ詳細ページにアクセスできる

## 設定ファイル

- `playwright.config.ts`: Playwrightの設定
  - 開発サーバー自動起動: `http://localhost:5173`
  - ブラウザ: Chromium のみ
  - スクリーンショット: 失敗時のみ
  - トレース: リトライ時のみ

## トラブルシューティング

### テストが失敗する場合

1. **開発サーバーが起動しているか確認**

```bash
npm run dev
```

2. **Playwrightのブラウザがインストールされているか確認**

```bash
npx playwright install chromium
```

3. **テストレポートを確認**

テスト実行後、`playwright-report`ディレクトリにHTMLレポートが生成されます。

```bash
npx playwright show-report
```

### ポート5173が使用中の場合

他のプロセスがポート5173を使用している場合は、そのプロセスを終了してからテストを実行してください。

```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9
```

## CI/CD環境での実行

GitHubActionsなどのCI環境では、以下の設定が推奨されます:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright Browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## ベストプラクティス

1. **テストの独立性**: 各テストは独立して実行可能であり、他のテストに依存しない
2. **適切な待機**: `waitForLoadState`や`expect().toBeVisible()`で適切に待機する
3. **意味のあるセレクタ**: `getByRole`, `getByLabel`などのアクセシビリティセレクタを優先
4. **エラーハンドリング**: タイムアウトやネットワークエラーを考慮した実装
5. **テストデータ**: 本番データに影響を与えないテストデータを使用
