import { Card } from '@/components/common/Card'
import { Spinner } from '@/components/common/Loading'
import { ErrorMessage } from '@/components/common/ErrorMessage'
import { useInquiryDetail } from '@/hooks/useInquiryDetail'
import { formatDate } from '@/utils/formatDate'
import { maskEmail } from '@/utils/maskEmail'
import { PollingIndicator } from './PollingIndicator'
import { AnswerDisplay } from './AnswerDisplay'
import { CategoryBadge } from './CategoryBadge'

interface InquiryDetailProps {
  id: string
}

export function InquiryDetail({ id }: InquiryDetailProps) {
  const {
    data: inquiry,
    isLoading,
    error,
    isPolling,
    elapsedTime,
    refetch,
  } = useInquiryDetail(id)

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

  if (!inquiry) {
    return <ErrorMessage message="お問い合わせが見つかりませんでした" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              お問い合わせ詳細
            </h2>
            {inquiry.Category && <CategoryBadge category={inquiry.Category} />}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">お名前:</span>
              <span className="ml-2 text-gray-900">{inquiry.userName}</span>
            </div>
            <div>
              <span className="text-gray-500">メールアドレス:</span>
              <span className="ml-2 text-gray-900">
                {maskEmail(inquiry.mailAddress)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">送信日時:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(inquiry.createdDate)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">ID:</span>
              <span className="ml-2 text-gray-600 font-mono text-xs">
                {inquiry.id}
              </span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              お問い合わせ内容
            </h3>
            <p className="text-gray-900 whitespace-pre-wrap">
              {inquiry.reviewText}
            </p>
          </div>
        </div>
      </Card>

      {inquiry.Category === '質問' && !inquiry.answer && (
        <PollingIndicator isPolling={isPolling} elapsedTime={elapsedTime} />
      )}

      {inquiry.answer && <AnswerDisplay answer={inquiry.answer} />}

      {inquiry.Category && inquiry.Category !== '質問' && !inquiry.answer && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-600">
          <p>
            このお問い合わせは「{inquiry.Category}」として分類されました。
            {inquiry.Category === 'ポジティブな感想' && 'ご感想をいただきありがとうございます。'}
            {inquiry.Category === 'ネガティブな感想' && '貴重なご意見をありがとうございます。改善に努めてまいります。'}
            {inquiry.Category === '改善提案' && 'ご提案をいただきありがとうございます。検討させていただきます。'}
          </p>
        </div>
      )}
    </div>
  )
}
