import { useQuery } from '@tanstack/react-query'
import { fetchInquiryList } from '@/api/inquiry'

interface UseInquiryListOptions {
  enabled?: boolean
}

export function useInquiryList(
  mailAddress: string,
  options: UseInquiryListOptions = {}
) {
  const { enabled = true } = options

  return useQuery({
    queryKey: ['inquiries', mailAddress],
    queryFn: () => fetchInquiryList(mailAddress),
    enabled: enabled && !!mailAddress,
    staleTime: 30000, // 30 seconds
  })
}
