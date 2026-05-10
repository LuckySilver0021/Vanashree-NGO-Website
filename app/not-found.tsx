import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { IconTree, IconArrowLeft, IconHome } from '@tabler/icons-react'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-cream pt-16">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-leaf/10 to-fern/10 flex items-center justify-center mx-auto mb-6">
          <IconTree size={36} className="text-leaf/40" />
        </div>
        <h1 className="text-7xl font-bold text-forest mb-2">404</h1>
        <h2 className="text-xl font-semibold text-forest mb-3">Page Not Found</h2>
        <p className="text-stone text-base leading-relaxed mb-8">
          Looks like this path doesn&apos;t lead anywhere. Let&apos;s get you back to solid ground.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            asChild
            className="bg-forest text-white hover:bg-canopy rounded-full transition-all duration-300"
          >
            <Link href="/">
              <IconHome size={16} className="mr-1.5" />
              Go Home
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all duration-300"
          >
            <Link href="/programs">
              <IconArrowLeft size={16} className="mr-1.5" />
              View Programs
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
