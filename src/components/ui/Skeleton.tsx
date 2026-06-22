interface SkeletonProps {
  className?: string
  variant?: 'rectangular' | 'circular' | 'text'
  width?: string
  height?: string
  count?: number
}

const Skeleton = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) => {
  const baseClasses = 'skeleton'
  const variantClasses = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  }

  const style: React.CSSProperties = {}
  if (width) style.width = width
  if (height) style.height = height

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

// Pre-built skeleton layouts for common patterns
export const CardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-card ${className}`}>
    <Skeleton className="w-full h-48" />
    <div className="p-6 space-y-3">
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-full h-5" />
      <Skeleton className="w-3/4 h-4" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="w-20 h-8" />
        <Skeleton className="w-20 h-8" />
      </div>
    </div>
  </div>
)

export const DoctorCardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-card ${className}`}>
    <Skeleton className="w-full h-64" />
    <div className="p-6 space-y-3">
      <Skeleton className="w-32 h-5" />
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-2/3 h-4" />
      <div className="flex justify-between pt-3">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  </div>
)

export const StatSkeleton = () => (
  <div className="text-center">
    <Skeleton variant="circular" className="w-16 h-16 mx-auto mb-4" />
    <Skeleton className="w-20 h-10 mx-auto mb-2" />
    <Skeleton className="w-24 h-4 mx-auto" />
  </div>
)

export const ArticleCardSkeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-card ${className}`}>
    <Skeleton className="w-full h-48" />
    <div className="p-6 space-y-3">
      <div className="flex gap-2">
        <Skeleton className="w-16 h-6" />
        <Skeleton className="w-24 h-6" />
      </div>
      <Skeleton className="w-full h-6" />
      <Skeleton className="w-5/6 h-6" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-3/4 h-4" />
    </div>
  </div>
)

export default Skeleton
