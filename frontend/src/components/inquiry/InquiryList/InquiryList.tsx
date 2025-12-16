import { Spinner } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useInquiryList } from '@/hooks/useInquiryList'
import { InquiryItem } from './InquiryItem'
import { EmptyState } from './EmptyState'

interface InquiryListProps {
  mailAddress: string
}

export function InquiryList({ mailAddress }: InquiryListProps) {
  const { data, isLoading, error, refetch } = useInquiryList(mailAddress)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorMessage
        message={error instanceof Error ? error.message : 'エラーが発生しました'}
        onRetry={() => refetch()}
      />
    )
  }

  if (!data || data.items.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {data.count}件のお問い合わせが見つかりました
      </p>
      <div className="space-y-3">
        {data.items.map((inquiry) => (
          <InquiryItem key={inquiry.id} inquiry={inquiry} />
        ))}
      </div>
    </div>
  )
}
