import {
  getPrograms,
  getImpactMetrics,
  getLatestPosts,
  getPageContent,
} from '@/lib/content'
import { heroImage, galleryImages } from '@/lib/gallery'
import { FadeIn } from '@/components/motion/FadeIn'
import { StaggerGrid, StaggerItem } from '@/components/motion/StaggerGrid'
import { SectionReveal } from '@/components/motion/SectionReveal'
import { ImpactStrip } from '@/components/sections/ImpactStrip'
import { BlogCard } from '@/components/sections/BlogCard'
import { CTASection } from '@/components/sections/CTASection'
import { MissionVisionCards } from '@/components/sections/MissionVisionCards'
import { DynamicIcon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from 'next/image'
import {
  IconArrowRight,
  IconCalendar,
  IconChevronRight,
  IconLeaf,
  IconHandStop,
  IconCheck,
} from '@tabler/icons-react'

export default async function HomePage() {
  const [programs, metrics, posts, page] = await Promise.all([
    getPrograms(),
    getImpactMetrics(),
    getLatestPosts(3),
    getPageContent(),
  ])

  return (
    <>
      {/* ━━━ Hero ━━━ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
        {/* Cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-forest/40 to-forest/80" />
        {/* Warm glow accent */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[300px] rounded-full bg-gold/8 blur-3xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 pb-16">
          <FadeIn>
            <Badge className="mb-6 bg-gold/20 text-gold border-gold/30 backdrop-blur-md px-4 py-1.5 text-xs font-medium tracking-wide shadow-sm">
              <IconLeaf size={14} className="mr-1.5" />
              {page.heroBadge}
            </Badge>
          </FadeIn>
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-[1.08] tracking-tight whitespace-pre-line drop-shadow-lg">
              {page.heroTagline}
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="mt-6 text-white/75 text-base md:text-xl leading-relaxed max-w-2xl mx-auto">
              {page.heroSubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.35}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gold hover:bg-amber text-forest font-bold rounded-full px-8 text-base h-13 shadow-lg shadow-gold/25 transition-all duration-300 hover:scale-[1.02]"
              >
                <Link href="/programs">
                  {page.heroCta1}
                  <IconArrowRight size={18} className="ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white/25 text-white hover:bg-white/10 font-semibold rounded-full px-8 bg-transparent text-base h-13 backdrop-blur-sm transition-all duration-300"
              >
                <Link href="/contact">{page.heroCta2}</Link>
              </Button>
            </div>
          </FadeIn>
          {/* Scroll hint */}
          <FadeIn delay={0.7}>
            <div className="mt-20 flex flex-col items-center gap-2 text-white/30">
              <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
              <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ About ━━━ */}
      <section className="relative py-24 md:py-36 bg-white overflow-hidden">
        {/* Decorative organic shape */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-cream/60 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sand/40 blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn direction="left">
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-4">
                About Vanashree
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-forest leading-snug mb-6">
                {page.aboutTitle}
              </h2>
              <p className="text-stone text-base md:text-lg leading-relaxed">
                {page.aboutBody}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="text-forest border-forest/20 px-3 py-1 text-xs font-medium bg-cream/50">
                  <IconCalendar size={13} className="mr-1.5" />
                  {page.aboutEstablished}
                </Badge>
                <Badge variant="outline" className="text-gold border-gold/25 px-3 py-1 text-xs font-medium bg-sand/50">
                  {page.aboutLocation}
                </Badge>
              </div>
              <div className="mt-8">
                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all duration-300 group"
                >
                  <Link href="/about">
                    Learn Our Story
                    <IconChevronRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <div className="relative">
                {/* Main image */}
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-forest/10">
                  <Image
                    src={galleryImages[15].src}
                    alt={galleryImages[15].alt}
                    width={galleryImages[15].width}
                    height={galleryImages[15].height}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                {/* Floating stats card with warm accent */}
                <div className="absolute -bottom-6 -left-6 bg-white rounded-xl px-5 py-4 shadow-xl shadow-forest/8 border border-gold/15">
                  <p className="text-3xl font-bold text-forest">{page.aboutServiceYears}</p>
                  <p className="text-xs text-pebble mt-0.5">Years of impact</p>
                  <div className="mt-2 h-0.5 w-8 bg-gradient-to-r from-gold to-amber rounded" />
                </div>
                {/* Decorative accent corners */}
                <div className="absolute -top-3 -right-3 w-12 h-12 border-t-2 border-r-2 border-gold/30 rounded-tr-xl" />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ━━━ Mission & Vision ━━━ */}
      <MissionVisionCards
        mission={page.missionStatement}
        vision={page.visionStatement}
      />

      {/* ━━━ Programs ━━━ */}
      <section className="relative py-24 md:py-36 bg-cream overflow-hidden">
        {/* Organic shape */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <SectionReveal
            eyebrow="What We Do"
            heading="Three Pillars of Change"
            sub="Community-driven programmes creating lasting impact across rural Maharashtra"
            center
          />
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-16">
            {programs.map((program, idx) => (
              <StaggerItem key={program._id}>
                <Link href={`/programs#${program.slug}`} className="group block h-full">
                  <div className="relative bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl border border-moss/15 transition-all duration-500 group-hover:-translate-y-2 h-full flex flex-col overflow-hidden">
                    {/* Colored top accent bar */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      idx === 0 ? 'bg-gradient-to-r from-leaf to-fern' :
                      idx === 1 ? 'bg-gradient-to-r from-gold to-amber' :
                      'bg-gradient-to-r from-terracotta to-gold'
                    }`} />
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${
                      idx === 0 ? 'bg-leaf/10 group-hover:bg-leaf/15' :
                      idx === 1 ? 'bg-gold/10 group-hover:bg-gold/15' :
                      'bg-terracotta/10 group-hover:bg-terracotta/15'
                    }`}>
                      <DynamicIcon
                        name={program.icon}
                        size={28}
                        className={
                          idx === 0 ? 'text-leaf' :
                          idx === 1 ? 'text-gold' :
                          'text-terracotta'
                        }
                      />
                    </div>
                    <h3 className="text-forest font-bold text-lg mb-3 group-hover:text-leaf transition-colors duration-300">
                      {program.title}
                    </h3>
                    <p className="text-stone text-sm leading-relaxed flex-1">
                      {program.shortDescription}
                    </p>
                    {/* Highlights */}
                    {program.highlights && (
                      <ul className="mt-4 space-y-1.5">
                        {program.highlights.slice(0, 2).map((h) => (
                          <li key={h} className="flex items-start gap-2 text-xs text-pebble">
                            <IconCheck size={12} className="text-leaf mt-0.5 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-5 flex items-center text-leaf text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                      Learn more <IconArrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ━━━ Impact Numbers ━━━ */}
      <ImpactStrip metrics={metrics} variant="full" />

      {/* ━━━ Gallery Preview ━━━ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-gold text-sm font-semibold uppercase tracking-widest mb-3">
                Our Gallery
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-forest leading-snug">
                Stories in Pictures
              </h2>
            </div>
            <FadeIn className="hidden md:block">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all duration-300"
              >
                <Link href="/gallery">
                  View Gallery
                  <IconArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </FadeIn>
          </div>
          <FadeIn>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {galleryImages.slice(0, 8).map((img, idx) => (
                <Link
                  key={img.src}
                  href="/gallery"
                  className={`relative overflow-hidden rounded-xl group ${
                    idx === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                >
                  <div className={`${idx === 0 ? 'aspect-square' : 'aspect-[4/3]'} relative`}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={img.width}
                      height={img.height}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                      sizes={idx === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-forest/0 group-hover:bg-forest/30 transition-colors duration-500" />
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
          <FadeIn className="md:hidden mt-6 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white"
            >
              <Link href="/gallery">
                View All Photos
                <IconArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ Blog Preview ━━━ */}
      <section className="py-20 md:py-32 bg-cream">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-end justify-between mb-14">
            <div className="flex-1">
              <SectionReveal
                eyebrow="From the Field"
                heading="Stories & Updates"
                sub="News, stories, and updates from our work on the ground"
              />
            </div>
            <FadeIn className="hidden md:block">
              <Button
                asChild
                variant="outline"
                className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white transition-all duration-300"
              >
                <Link href="/blog">
                  All Posts
                  <IconArrowRight size={16} className="ml-1" />
                </Link>
              </Button>
            </FadeIn>
          </div>
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
          <FadeIn className="md:hidden mt-8 text-center">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-forest/20 text-forest hover:bg-forest hover:text-white"
            >
              <Link href="/blog">
                View All Posts
                <IconArrowRight size={16} className="ml-1" />
              </Link>
            </Button>
          </FadeIn>
        </div>
      </section>

      {/* ━━━ CTA ━━━ */}
      <CTASection
        title={page.ctaTitle}
        body={page.ctaBody}
        primaryLabel={page.ctaButtonText}
        primaryHref="/contact"
        secondaryLabel="Learn About Us"
        secondaryHref="/about"
        icon={<IconHandStop size={30} className="text-gold" />}
      />
    </>
  )
}
