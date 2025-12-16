import { Link } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { CategoryBadge } from '@/components/inquiry/InquiryDetail'
import { formatDate } from '@/utils/formatDate'
import type { Inquiry } from '@/types/inquiry'

interface InquiryItemProps {
  inquiry: Inquiry
}

export function InquiryItem({ inquiry }: InquiryItemProps) {
  const hasAnswer = !!inquiry.answer
  const truncatedText =
    inquiry.reviewText.length > 100
      ? `${inquiry.reviewText.slice(0, 100)}...`
      : inquiry.reviewText

  return (
    <Link to={`/inquiry/${inquiry.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm text-gray-500">
                {formatDate(inquiry.createdDate)}
              </span>
              {inquiry.Category && <CategoryBadge category={inquiry.Category} />}
              {hasAnswer && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  回答済み
                </span>
              )}
            </div>
            <p className="text-gray-900 line-clamp-2">{truncatedText}</p>
          </div>
          <svg
            className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </Card>
    </Link>
  )
}
