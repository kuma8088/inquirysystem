import { Link } from 'react-router-dom'
import { Button } from '@/components/common/Button'

export function NotFoundPage() {
  return (
    <div className="text-center py-12">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        ページが見つかりません
      </h2>
      <p className="text-gray-600 mb-8">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link to="/">
        <Button>ホームに戻る</Button>
      </Link>
    </div>
  )
}
