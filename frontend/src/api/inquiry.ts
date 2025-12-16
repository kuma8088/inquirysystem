import { apiClient } from './client'
import type {
  Inquiry,
  CreateInquiryRequest,
  CreateInquiryResponse,
  InquiryListResponse,
} from '@/types/inquiry'

export async function createInquiry(
  data: CreateInquiryRequest
): Promise<CreateInquiryResponse> {
  return apiClient<CreateInquiryResponse>('/inquiry', {
    method: 'POST',
    body: data,
  })
}

export async function fetchInquiryDetail(id: string): Promise<Inquiry> {
  return apiClient<Inquiry>(`/inquiry/${id}`)
}

export async function fetchInquiryList(
  mailAddress: string
): Promise<InquiryListResponse> {
  return apiClient<InquiryListResponse>(
    `/inquiry?mailAddress=${encodeURIComponent(mailAddress)}`
  )
}
