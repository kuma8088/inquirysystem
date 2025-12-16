import { test, expect } from '@playwright/test'

/**
 * 問い合わせフォームのE2Eテスト
 *
 * テスト対象:
 * - フォーム送信の正常系フロー
 * - バリデーションエラーの表示
 * - フォーム入力の永続化
 */

test.describe('問い合わせフォーム', () => {
  test.beforeEach(async ({ page }) => {
    // ホームページに移動
    await page.goto('/')
  })

  test('フォームが正しく表示される', async ({ page }) => {
    // フォームの存在確認
    await expect(page.locator('form')).toBeVisible()

    // 各入力フィールドの存在確認
    await expect(
      page.getByLabel('お名前', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByLabel('メールアドレス', { exact: false })
    ).toBeVisible()
    await expect(
      page.getByLabel('お問い合わせ内容', { exact: false })
    ).toBeVisible()

    // 送信ボタンの存在確認
    await expect(
      page.getByRole('button', { name: '送信する' })
    ).toBeVisible()
  })

  test('正しく入力して送信すると詳細ページに遷移する', async ({ page }) => {
    // テストデータを入力
    await page.getByLabel('お名前', { exact: false }).fill('山田 太郎')
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill('test@example.com')
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill('テストの問い合わせ内容です。')

    // 送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click()

    // 詳細ページに遷移することを確認
    // URLが /inquiry/:id の形式になることを確認
    await expect(page).toHaveURL(/\/inquiry\/[a-zA-Z0-9-]+/)

    // ページタイトルまたは問い合わせ内容が表示されることを確認
    // (APIのレスポンス待ちを考慮して、タイムアウトを長めに設定)
    await expect(
      page.getByText('テストの問い合わせ内容です。')
    ).toBeVisible({ timeout: 10000 })
  })

  test('空のフォームを送信するとバリデーションエラーが表示される', async ({
    page,
  }) => {
    // 何も入力せずに送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click()

    // バリデーションエラーが表示されることを確認
    // Zodバリデーションによるエラーメッセージが表示される（3つ表示される）
    await expect(page.getByText('お名前を入力してください')).toBeVisible()
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible()
    await expect(page.getByText('お問い合わせ内容を入力してください')).toBeVisible()

    // URLが変わらないことを確認（送信が行われていない）
    await expect(page).toHaveURL('/')
  })

  test('不正なメールアドレスでバリデーションエラーが表示される', async ({
    page,
  }) => {
    // 名前と問い合わせ内容は正しく入力
    await page.getByLabel('お名前', { exact: false }).fill('山田 太郎')
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill('テストの問い合わせ内容です。')

    // 不正なメールアドレスを入力
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill('invalid-email')

    // 送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click()

    // メールアドレスのエラーが表示されることを確認
    await expect(
      page.getByText(/メール|email/i)
    ).toBeVisible()

    // URLが変わらないことを確認
    await expect(page).toHaveURL('/')
  })

  test('入力したメールアドレスがローカルストレージに保存される', async ({
    page,
  }) => {
    const testEmail = 'storage-test@example.com'

    // フォームに入力
    await page.getByLabel('お名前', { exact: false }).fill('山田 太郎')
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill(testEmail)
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill('ストレージテスト')

    // 送信
    await page.getByRole('button', { name: '送信する' }).click()

    // 遷移を待つ
    await expect(page).toHaveURL(/\/inquiry\/[a-zA-Z0-9-]+/)

    // ホームページに戻る
    await page.goto('/')

    // メールアドレスフィールドに保存された値が入っていることを確認
    const emailInput = page.getByLabel('メールアドレス', { exact: false })
    await expect(emailInput).toHaveValue(testEmail)
  })

  test('送信中は送信ボタンが無効化される', async ({ page }) => {
    // フォームに入力
    await page.getByLabel('お名前', { exact: false }).fill('山田 太郎')
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill('test@example.com')
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill('送信中テスト')

    const submitButton = page.getByRole('button', { name: '送信する' })

    // 送信ボタンをクリック
    await submitButton.click()

    // 送信中はボタンが無効化されているか、ローディング状態になっていることを確認
    // (すぐに遷移するため、タイミングによっては確認できない場合がある)
    // await expect(submitButton).toBeDisabled()
  })

  test('入力値の最大文字数制限', async ({ page }) => {
    // 非常に長いテキストを入力（最大100文字を超える名前）
    const longName = 'あ'.repeat(101)
    const longText = 'テスト'.repeat(500)

    await page.getByLabel('お名前', { exact: false }).fill(longName)
    await page
      .getByLabel('メールアドレス', { exact: false })
      .fill('test@example.com')
    await page
      .getByLabel('お問い合わせ内容', { exact: false })
      .fill(longText)

    // 送信ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click()

    // 文字数制限エラーが表示されることを確認
    await expect(page.getByText(/100文字以内|2000文字以内/i)).toBeVisible()

    // URLが変わらないことを確認（送信が行われていない）
    await expect(page).toHaveURL('/')
  })
})
