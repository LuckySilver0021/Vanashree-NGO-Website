import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/content'
import { PageHeader } from '@/components/layout/PageHeader'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerGrid, StaggerItem } from '@/components/motion/StaggerGrid'
import { BlogCard } from '@/components/sections/BlogCard'
import { IconLeaf } from '@tabler/icons-react'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Stories, updates, and news from Vanashree Gramvikas Pratishthan — plantation drives, education initiatives, and community impact.',
}

export default async function BlogPage() {
  const posts = await getAllPosts()

  return (
    <>
      <PageHeader
        eyebrow="Blog & Updates"
        title="From the Field"
        description="Stories, news, and updates from our work on the ground"
      />

      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {posts.length === 0 ? (
            <FadeIn>
              <div className="text-center py-20">
                <IconLeaf size={48} className="text-gold/30 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-forest mb-2">No posts yet</h2>
                <p className="text-stone text-base">Check back soon for stories from the field.</p>
              </div>
            </FadeIn>
          ) : (
            <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {posts.map((post) => (
                <StaggerItem key={post._id}>
                  <BlogCard
                    post={post}
                    imageSrc={post.coverImage}
                    imageWidth={800}
                    imageHeight={500}
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </div>
      </section>
    </>
  )
}
