import { Skeleton } from "@/components/ui/skeleton"

export function GraphSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-64 w-64">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${20 + Math.random() * 20}px`,
              height: `${20 + Math.random() * 20}px`,
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 80}%`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-6">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
