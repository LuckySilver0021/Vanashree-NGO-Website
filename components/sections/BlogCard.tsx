import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { IconCalendar, IconArrowRight } from '@tabler/icons-react'
import type { Post } from '@/lib/content/mock'

interface BlogCardProps {
  post: Post
  imageSrc: string
  imageWidth: number
  imageHeight: number
}

export function BlogCard({ post, imageSrc, imageWidth, imageHeight }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-moss/15 transition-all duration-500 group-hover:-translate-y-1.5 h-full flex flex-col">
        <div className="aspect-[16/10] relative overflow-hidden">
          <Image
            src={imageSrc}
            alt={post.title}
            width={imageWidth}
            height={imageHeight}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-white/95 text-forest border-0 text-[10px] font-semibold uppercase tracking-wider shadow-sm">
              {post.category}
            </Badge>
          </div>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-1.5 text-pebble text-xs mb-3">
            <IconCalendar size={13} />
            {new Date(post.publishedAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <h3 className="text-forest font-bold text-base leading-snug group-hover:text-leaf transition-colors duration-300">
            {post.title}
          </h3>
          <p className="text-stone text-sm mt-2 leading-relaxed line-clamp-2 flex-1">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center text-leaf text-sm font-semibold">
            Read Article
            <IconArrowRight
              size={14}
              className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
            />
          </div>
        </div>
      </article>
    </Link>
  )
}
