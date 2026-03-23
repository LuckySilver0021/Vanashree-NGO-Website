export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-petal p-6 animate-pulse">
      <div className="h-4 bg-moss/40 rounded w-3/4 mb-3" />
      <div className="h-3 bg-moss/30 rounded w-full mb-2" />
      <div className="h-3 bg-moss/30 rounded w-5/6" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-forest/20 animate-pulse flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-forest/30" />
    </div>
  )
}

export function ImageSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-moss/20 animate-pulse rounded-xl ${className}`}
    />
  )
}
