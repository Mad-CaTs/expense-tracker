import { cn } from '@/lib/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

export function ExpenseRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-4 border-b border-[#1a1a1a]">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  )
}

export function BudgetCardSkeleton() {
  return (
    <div className="bg-[#111] rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}
