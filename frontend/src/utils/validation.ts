import { z } from 'zod'

export const inquiryFormSchema = z.object({
  userName: z
    .string()
    .min(1, 'お名前を入力してください')
    .max(100, 'お名前は100文字以内で入力してください'),
  mailAddress: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  reviewText: z
    .string()
    .min(1, 'お問い合わせ内容を入力してください')
    .max(2000, 'お問い合わせ内容は2000文字以内で入力してください'),
})

export type InquiryFormData = z.infer<typeof inquiryFormSchema>

export const searchFormSchema = z.object({
  mailAddress: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
})

export type SearchFormData = z.infer<typeof searchFormSchema>
