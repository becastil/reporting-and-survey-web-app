import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { skeletonPulse } from "@/lib/motion"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: boolean
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = true,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-lg',
  }

  const baseClasses = "bg-muted animate-pulse"
  
  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  }

  if (animation) {
    return (
      <motion.div
        className={cn(baseClasses, variantClasses[variant], className)}
        style={style}
        variants={skeletonPulse}
        animate="animate"
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      style={style}
      {...props}
    />
  )
}

// Compound components for common patterns
const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 ? "80%" : "100%"}
        />
      ))}
    </div>
  )
}

const SkeletonCard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <SkeletonText lines={3} />
      </div>
    </div>
  )
}

const SkeletonTable = ({ rows = 5, columns = 4, className }: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex border-b pb-2 mb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton variant="text" width="60%" />
          </div>
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex py-3 border-b border-muted">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-2">
              <Skeleton 
                variant="text" 
                width={colIndex === 0 ? "80%" : "60%"} 
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

const SkeletonDashboard = ({ className }: { className?: string }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Money Meter Skeleton */}
      <div className="flex justify-center">
        <div className="text-center space-y-2">
          <Skeleton variant="text" width={200} height={48} className="mx-auto" />
          <Skeleton variant="text" width={100} height={20} className="mx-auto" />
        </div>
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={120} height={40} />
        ))}
      </div>
      
      {/* Grid and Panel Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonTable rows={8} columns={5} />
        </div>
        <div>
          <SkeletonCard />
        </div>
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonTable,
  SkeletonDashboard 
}