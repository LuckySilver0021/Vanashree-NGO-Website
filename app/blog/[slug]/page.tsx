import type { Metadata } from 'next'
import { getPostBySlug, getAllPosts } from '@/lib/content'
import { notFound } from 'next/navigation'
import { FadeIn } from '@/components/motion/FadeIn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconCalendar,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      {/* ─── Header ─── */}
      <section className="relative pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-forest via-canopy to-forest" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full bg-gold/5 blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6">
          <FadeIn>
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white text-sm mb-6 transition-colors">
              <IconArrowLeft size={14} />
              Back to Blog
            </Link>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Badge className="mb-4 bg-gold/20 text-gold border-gold/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
              {post.category}
            </Badge>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight tracking-tight">
              {post.title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="flex items-center gap-2 text-white/40 text-sm mt-5">
              <IconCalendar size={14} />
              {new Date(post.publishedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Cover image ─── */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-6 -mt-2">
          <FadeIn>
            <div className="aspect-[2/1] rounded-2xl overflow-hidden shadow-xl shadow-forest/10 border border-moss/10">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={1200}
                height={600}
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Article body ─── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <FadeIn>
            <article className="prose prose-lg prose-headings:text-forest prose-a:text-leaf prose-strong:text-forest prose-p:text-stone prose-p:leading-relaxed max-w-none">
              {post.body.split('\n\n').map((para, i) => (
                <p key={i} className="text-stone text-base md:text-lg leading-relaxed mb-5">
                  {para}
                </p>
              ))}
            </article>
          </FadeIn>

          <Separator className="my-12 bg-moss/15" />

          {/* Navigation */}
          <FadeIn>
            <div className="flex items-center justify-between">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all duration-300"
              >
                <Link href="/blog">
                  <IconArrowLeft size={16} className="mr-1" />
                  All Posts
                </Link>
              </Button>
              <Button
                asChild
                className="bg-gold text-forest hover:bg-amber font-bold rounded-full transition-all duration-300"
              >
                <Link href="/contact">
                  Get Involved
                  <IconArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  )
}
