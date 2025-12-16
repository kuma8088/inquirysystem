import { useParams, Link } from 'react-router-dom'
import { InquiryDetail } from '@/components/inquiry/InquiryDetail'
import { Button } from '@/components/common/Button'

export function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">お問い合わせIDが指定されていません</p>
        <Link to="/">
          <Button variant="secondary" className="mt-4">
            ホームに戻る
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="text-blue-600 hover:text-blue-700 flex items-center text-sm"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          新規お問い合わせ
        </Link>
      </div>

      <InquiryDetail id={id} />
    </div>
  )
}
