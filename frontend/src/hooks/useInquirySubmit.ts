import { useMutation } from '@tanstack/react-query'
import { createInquiry } from '@/api/inquiry'
import type { CreateInquiryRequest } from '@/types/inquiry'

export function useInquirySubmit() {
  return useMutation({
    mutationFn: (data: CreateInquiryRequest) => createInquiry(data),
  })
}
