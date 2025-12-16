import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E テスト設定
 *
 * 開発サーバーを自動起動し、問い合わせシステムのE2Eテストを実行します。
 * - テスト対象: http://localhost:5173
 * - ブラウザ: Chromium のみ
 * - スクリーンショット: 失敗時のみ取得
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './e2e',

  // 各テストのタイムアウト (30秒)
  timeout: 30000,

  // 並列実行の設定
  fullyParallel: true,

  // CI環境ではリトライしない、ローカルでは1回リトライ
  retries: process.env.CI ? 2 : 0,

  // 並列ワーカー数
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // 共通設定
  use: {
    // ベースURL (環境変数で上書き可能)
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // トレース設定: 失敗時のみ記録
    trace: 'on-first-retry',

    // スクリーンショット: 失敗時のみ取得
    screenshot: 'only-on-failure',

    // ビデオ: 失敗時のみ記録
    video: 'retain-on-failure',
  },

  // テスト対象ブラウザ
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // 開発サーバーの自動起動設定
  // BASE_URL が設定されている場合は開発サーバーを起動しない（本番テスト用）
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120000, // サーバー起動タイムアウト: 2分
      },
})
