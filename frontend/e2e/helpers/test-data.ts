/**
 * E2Eテスト用のテストデータ
 *
 * テストで使用する共通のテストデータを定義します。
 */

export const testUsers = {
  valid: {
    userName: '山田 太郎',
    mailAddress: 'yamada@example.com',
    reviewText: 'これはテストの問い合わせ内容です。',
  },
  withLongName: {
    userName: 'あ'.repeat(100), // 最大文字数
    mailAddress: 'long-name@example.com',
    reviewText: '長い名前のテストです。',
  },
  withLongText: {
    userName: '佐藤 花子',
    mailAddress: 'sato@example.com',
    reviewText: 'テスト'.repeat(500), // 最大文字数
  },
  invalidEmail: {
    userName: '田中 次郎',
    mailAddress: 'invalid-email', // 不正なメールアドレス
    reviewText: '不正なメールアドレスのテストです。',
  },
}

export const testInquiries = {
  sample1: {
    id: 'test-inquiry-001',
    userName: 'テストユーザー1',
    mailAddress: 'test1@example.com',
    reviewText: 'サンプルの問い合わせ1',
    category: '施設について',
    answer: 'ご質問ありがとうございます。',
  },
  sample2: {
    id: 'test-inquiry-002',
    userName: 'テストユーザー2',
    mailAddress: 'test2@example.com',
    reviewText: 'サンプルの問い合わせ2',
    category: '予約について',
    answer: null, // 未回答
  },
}

/**
 * ランダムなメールアドレスを生成
 * テストの独立性を確保するため、毎回異なるメールアドレスを使用できます
 */
export function generateRandomEmail(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return `test-${timestamp}-${random}@example.com`
}

/**
 * ランダムなユーザー名を生成
 */
export function generateRandomUserName(): string {
  const names = ['山田', '佐藤', '田中', '鈴木', '高橋']
  const firstName = ['太郎', '花子', '次郎', '美咲', '健太']
  const lastName = names[Math.floor(Math.random() * names.length)]
  const first = firstName[Math.floor(Math.random() * firstName.length)]
  return `${lastName} ${first}`
}
