import clsx from 'clsx'

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={clsx(
            'bg-gray-200 rounded',
            i < lines - 1 && 'mb-2',
            className || 'h-4 w-full'
          )}
        />
      ))}
    </div>
  )
}
