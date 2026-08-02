'use client'

import { ImageSkeleton } from '@/components/motion/Skeleton'

export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-moss/15 bg-white">
          <ImageSkeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <div className="h-6 w-1/3 animate-pulse rounded bg-moss/25" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-moss/20" />
            <div className="h-3 w-full animate-pulse rounded bg-moss/15" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-moss/15" />
          </div>
        </div>
      ))}
    </div>
  )
}
