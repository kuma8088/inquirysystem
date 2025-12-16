import { test, expect } from '@playwright/test'

/**
 * ナビゲーションのE2Eテスト
 *
 * テスト対象:
 * - ヘッダーナビゲーションリンク
 * - ページ間の遷移
 * - 404ページの表示
 * - ブラウザの戻る/進むボタンの動作
 */

test.describe('ナビゲーション', () => {
  test('ホームページからヘッダーリンクで各ページに遷移できる', async ({
    page,
  }) => {
    // ホームページに移動
    await page.goto('/')

    // ヘッダーにロゴが表示されていることを確認
    await expect(page.locator('header').getByText('サンプルホテル東京')).toBeVisible()

    // 履歴ページへ遷移
    await page.getByRole('link', { name: '履歴' }).click()
    await expect(page).toHaveURL('/history')

    // ホームページに戻る
    await page.getByRole('link', { name: 'お問い合わせ' }).click()
    await expect(page).toHaveURL('/')
  })

  test('ロゴクリックでホームページに戻る', async ({ page }) => {
    // 履歴ページに移動
    await page.goto('/history')

    // ヘッダーのロゴをクリック
    await page.locator('header').getByText('サンプルホテル東京').click()

    // ホームページに戻る
    await expect(page).toHaveURL('/')
  })

  test('存在しないページにアクセスすると404ページが表示される', async ({
    page,
  }) => {
    // 存在しないページにアクセス
    await page.goto('/non-existent-page')

    // 404ページが表示されることを確認
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'ページが見つかりません' })).toBeVisible()
  })

  test('404ページからホームページに戻れる', async ({ page }) => {
    // 存在しないページにアクセス
    await page.goto('/non-existent-page')

    // 404ページが表示されることを確認
    await expect(page.getByRole('heading', { name: '404' })).toBeVisible()

    // 「ホームに戻る」ボタンをクリック
    await page.getByRole('button', { name: 'ホームに戻る' }).click()

    // ホームページに戻る
    await expect(page).toHaveURL('/')
  })

  test('ブラウザの戻るボタンで前のページに戻れる', async ({ page }) => {
    // ホームページに移動
    await page.goto('/')

    // 履歴ページへ遷移
    await page.getByRole('link', { name: '履歴' }).click()
    await expect(page).toHaveURL('/history')

    // ブラウザの戻るボタンをクリック
    await page.goBack()
    await expect(page).toHaveURL('/')
  })

  test('ブラウザの進むボタンで次のページに進める', async ({ page }) => {
    // ホームページに移動
    await page.goto('/')

    // 履歴ページへ遷移
    await page.getByRole('link', { name: '履歴' }).click()
    await expect(page).toHaveURL('/history')

    // ブラウザの戻るボタンをクリック
    await page.goBack()
    await expect(page).toHaveURL('/')

    // ブラウザの進むボタンをクリック
    await page.goForward()
    await expect(page).toHaveURL('/history')
  })

  test('履歴ページで検索フォームが表示される', async ({ page }) => {
    // 履歴ページに移動
    await page.goto('/history')

    // ページタイトルが表示される
    await expect(page.getByRole('heading', { name: 'お問い合わせ履歴' })).toBeVisible()

    // 検索フォームが表示される
    await expect(page.getByPlaceholder('メールアドレスを入力')).toBeVisible()
    await expect(page.getByRole('button', { name: '検索' })).toBeVisible()
  })

  test('ヘッダーは全ページで表示される', async ({ page }) => {
    const pages = ['/', '/history']

    for (const pagePath of pages) {
      await page.goto(pagePath)

      // ヘッダーの存在確認
      await expect(page.locator('header')).toBeVisible()
      await expect(page.locator('header').getByText('サンプルホテル東京')).toBeVisible()

      // ナビゲーションリンクの存在確認
      await expect(
        page.getByRole('link', { name: 'お問い合わせ' })
      ).toBeVisible()
      await expect(page.getByRole('link', { name: '履歴' })).toBeVisible()
    }
  })

  test('404ページでもヘッダーは表示される', async ({ page }) => {
    await page.goto('/non-existent-page')

    // ヘッダーの存在確認
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header').getByText('サンプルホテル東京')).toBeVisible()
  })

  test('直接URLで問い合わせ詳細ページにアクセスできる', async ({ page }) => {
    // まず問い合わせを作成
    await page.goto('/')

    await page.getByLabel('お名前', { exact: false }).fill('テストユーザー')
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill('navigation@test.com')
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill('ナビゲーションテスト')

    await page.getByRole('button', { name: '送信する' }).click()

    // URLを取得
    await expect(page).toHaveURL(/\/inquiry\/[a-zA-Z0-9-]+/)
    const inquiryUrl = page.url()

    // 一度ホームページに戻る
    await page.goto('/')

    // 直接URLでアクセス
    await page.goto(inquiryUrl)

    // 問い合わせ内容が表示されることを確認
    await expect(
      page.getByText('ナビゲーションテスト')
    ).toBeVisible({ timeout: 10000 })
  })
})
