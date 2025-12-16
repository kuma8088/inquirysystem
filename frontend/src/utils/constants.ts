export const POLLING_CONFIG = {
  INITIAL_INTERVAL: 5000, // 5 seconds
  EXTENDED_INTERVAL: 10000, // 10 seconds after 30s
  EXTEND_AFTER: 30000, // 30 seconds
  TIMEOUT: 180000, // 3 minutes
} as const

export const STORAGE_KEYS = {
  MAIL_ADDRESS: 'inquiry_mail_address',
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  '質問': '質問',
  'ポジティブな感想': 'ポジティブな感想',
  'ネガティブな感想': 'ネガティブな感想',
  '改善提案': '改善提案',
  'その他': 'その他',
} as const

export const CATEGORY_COLORS: Record<string, string> = {
  '質問': 'bg-blue-100 text-blue-800',
  'ポジティブな感想': 'bg-green-100 text-green-800',
  'ネガティブな感想': 'bg-red-100 text-red-800',
  '改善提案': 'bg-yellow-100 text-yellow-800',
  'その他': 'bg-gray-100 text-gray-800',
} as const
