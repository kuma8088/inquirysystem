import clsx from 'clsx'
import { CATEGORY_COLORS } from '@/utils/constants'

interface CategoryBadgeProps {
  category: string
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category] || CATEGORY_COLORS['その他']

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass)}>
      {category}
    </span>
  )
}
