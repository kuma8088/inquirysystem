import { Spinner } from '@/components/common/Loading'
import { POLLING_CONFIG } from '@/utils/constants'

interface PollingIndicatorProps {
  isPolling: boolean
  elapsedTime: number
}

export function PollingIndicator({ isPolling, elapsedTime }: PollingIndicatorProps) {
  if (!isPolling) return null

  const remainingTime = Math.max(0, POLLING_CONFIG.TIMEOUT - elapsedTime)
  const remainingSeconds = Math.ceil(remainingTime / 1000)
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="flex items-center space-x-3 text-blue-600 bg-blue-50 rounded-lg p-4">
      <Spinner size="sm" />
      <div>
        <p className="font-medium">回答を生成中...</p>
        <p className="text-sm text-blue-500">
          残り約 {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>
    </div>
  )
}
