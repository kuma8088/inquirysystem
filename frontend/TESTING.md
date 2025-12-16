# テストガイド

このドキュメントでは、問い合わせシステムのテスト実行方法を説明します。

## テストの種類

### 1. ユニットテスト (Vitest)

React コンポーネントとユーティリティ関数のユニットテストです。

**実行方法:**

```bash
# ウォッチモード（開発時）
npm run test

# 1回だけ実行
npm run test:run

# カバレッジレポート付き
npm run test:coverage
```

**テストファイル:** `src/**/*.test.tsx`, `src/**/*.test.ts`

### 2. E2Eテスト (Playwright)

ブラウザを使った統合テストです。実際のユーザー操作をシミュレートします。

**実行方法:**

```bash
# ヘッドレスモード（CI/自動テスト向け）
npm run test:e2e

# UIモード（対話的なデバッグ）
npm run test:e2e:ui

# ブラウザを表示して実行
npm run test:e2e:headed

# デバッグモード
npm run test:e2e:debug
```

**テストファイル:** `e2e/**/*.spec.ts`

## E2Eテストの詳細

### 前提条件

Playwrightのブラウザバイナリをインストールする必要があります。

```bash
npx playwright install chromium
```

### 開発サーバーの自動起動

`playwright.config.ts`で開発サーバーの自動起動が設定されているため、手動でサーバーを起動する必要はありません。

```typescript
webServer: {
  command: 'npm run dev',
  port: 5173,
  reuseExistingServer: !process.env.CI,
}
```

### テストケース

#### 問い合わせフォーム (`e2e/inquiry-form.spec.ts`)

1. フォームが正しく表示される
2. 正しく入力して送信すると詳細ページに遷移する
3. 空のフォームを送信するとバリデーションエラーが表示される
4. 不正なメールアドレスでバリデーションエラーが表示される
5. 入力したメールアドレスがローカルストレージに保存される
6. 送信中は送信ボタンが無効化される
7. 入力値の最大文字数制限

#### ナビゲーション (`e2e/navigation.spec.ts`)

1. ホームページからヘッダーリンクで各ページに遷移できる
2. ロゴクリックでホームページに戻る
3. 存在しないページにアクセスすると404ページが表示される
4. 404ページからホームページに戻れる
5. ブラウザの戻るボタンで前のページに戻れる
6. ブラウザの進むボタンで次のページに進める
7. 履歴ページで問い合わせ一覧が表示される
8. ヘッダーは全ページで表示される
9. 404ページでもヘッダーは表示される
10. 直接URLで問い合わせ詳細ページにアクセスできる

### テストレポート

テスト実行後、以下のレポートが生成されます:

- **HTML レポート:** `playwright-report/index.html`

レポートを開く:

```bash
npx playwright show-report
```

### スクリーンショットとビデオ

失敗したテストのスクリーンショットとビデオは `test-results/` ディレクトリに保存されます。

### デバッグ

#### UIモードで実行

最も簡単なデバッグ方法です:

```bash
npm run test:e2e:ui
```

#### デバッグモードで実行

ステップ実行でテストをデバッグ:

```bash
npm run test:e2e:debug
```

#### 特定のテストのみ実行

```bash
# ファイル指定
npx playwright test e2e/inquiry-form.spec.ts

# テスト名で絞り込み
npx playwright test -g "フォームが正しく表示される"
```

## トラブルシューティング

### ポート5173が使用中

他のプロセスがポート5173を使用している場合:

```bash
# macOS/Linux
lsof -ti:5173 | xargs kill -9

# または、手動でプロセスを確認
lsof -i:5173
```

### Playwrightブラウザのインストールエラー

依存関係を含めてインストール:

```bash
npx playwright install --with-deps chromium
```

### テストがタイムアウトする

`playwright.config.ts`でタイムアウトを調整:

```typescript
timeout: 30000, // 30秒
```

### API呼び出しが失敗する

バックエンドサーバーが起動しているか確認してください。E2Eテストは実際のAPIを呼び出します。

## CI/CD環境

GitHub Actions での設定例:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

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

1. **テストの独立性**: 各テストは独立して実行可能
2. **適切な待機**: 非同期処理には`expect().toBeVisible()`などで待機
3. **意味のあるセレクタ**: アクセシビリティセレクタ(`getByRole`, `getByLabel`)を優先
4. **テストデータ**: 本番データに影響しないテストデータを使用
5. **定期的な実行**: CI/CDパイプラインに統合

## 参考リンク

- [Playwright 公式ドキュメント](https://playwright.dev/)
- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
