export interface Inquiry {
  id: string
  userName: string
  mailAddress: string
  reviewText: string
  createdDate: string
  Category?: string
  answer?: string
}

export interface CreateInquiryRequest {
  userName: string
  mailAddress: string
  reviewText: string
}

export interface CreateInquiryResponse {
  message: string
  id: string
}

export interface InquiryListResponse {
  items: Inquiry[]
  count: number
}

export type InquiryCategory = '質問' | 'ポジティブな感想' | 'ネガティブな感想' | '改善提案' | 'その他'
