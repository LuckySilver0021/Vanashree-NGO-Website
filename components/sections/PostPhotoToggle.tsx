'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { IconChevronLeft, IconChevronRight, IconPlayerPlay } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { galleryImages, type GalleryImage } from '@/lib/gallery'

interface PostPhotoToggleProps {
  title: string
  images: string[]
  posterSrc?: string
  className?: string
  frameClassName?: string
  stacked?: boolean
  firstImageObjectPosition?: string
}

function isVideoSource(src: string) {
  return src.toLowerCase().endsWith('.mp4')
}

const videoPoster: Record<string, string> = {
  '/videos/kt-1.mp4': '/images/gallery/kt-1-poster.webp',
  '/videos/kt-2.mp4': '/images/gallery/kt-2-poster.webp',
}

export function PostPhotoToggle({
  title,
  images,
  posterSrc,
  className,
  frameClassName,
  stacked = false,
  firstImageObjectPosition,
}: PostPhotoToggleProps) {
  const galleryBySrc = useMemo(
    () => new Map(galleryImages.map((image) => [image.src, image])),
    []
  )

  const resolvedImages: GalleryImage[] = useMemo(
    () =>
      images.map((src) => {
        const match = galleryBySrc.get(src)
        return (
          match ?? {
            src,
            alt: title,
            width: 1200,
            height: 800,
            category: 'event',
          }
        )
      }),
    [galleryBySrc, images, title]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  if (resolvedImages.length === 0) {
    return null
  }

  if (stacked) {
    return (
      <div className="grid gap-4 sm:gap-6">
        {resolvedImages.map((img, i) => (
          <div
            key={img.src}
            className="relative aspect-4/3 rounded-2xl overflow-hidden shadow-xl shadow-forest/10 border border-moss/10 bg-white"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={img.width}
              height={img.height}
            className={cn(
              'object-cover w-full h-full',
              activeIndex === 0 ? firstImageObjectPosition : undefined
            )}
              sizes="(max-width: 768px) 100vw, 896px"
              priority={i === 0}
            />
          </div>
        ))}
      </div>
    )
  }

  const activeImage = resolvedImages[activeIndex]
  const activeIsVideo = isVideoSource(activeImage.src)

  const goPrev = () => {
    setActiveIndex((current) => (current - 1 + resolvedImages.length) % resolvedImages.length)
    setIsPlaying(false)
  }

  const goNext = () => {
    setActiveIndex((current) => (current + 1) % resolvedImages.length)
    setIsPlaying(false)
  }

  const activeVideoPoster = posterSrc ?? videoPoster[activeImage.src] ?? '/images/gallery/gallery-28.webp'

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'relative aspect-2/1 rounded-2xl overflow-hidden shadow-xl shadow-forest/10 border border-moss/10 bg-white',
          frameClassName
        )}
      >
        {activeIsVideo ? (
          <div className="relative w-full h-full bg-black">
            {isPlaying ? (
              <video
                key={activeImage.src}
                src={activeImage.src}
                controls
                autoPlay
                playsInline
                preload="metadata"
                poster={activeVideoPoster}
                className="absolute inset-0 m-auto w-full h-full object-contain bg-black"
                onEnded={() => setIsPlaying(false)}
              />
            ) : (
              <>
                <Image
                  src={activeVideoPoster}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 896px"
                  className="object-cover object-center"
                  priority={activeIndex === 0}
                />
                <div className="absolute inset-0 bg-black/15" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="h-14 w-14 rounded-full bg-white text-forest shadow-lg shadow-black/25 hover:bg-cream hover:scale-105 transition-all"
                    aria-label="Play video"
                  >
                    <IconPlayerPlay size={22} className="ml-0.5" />
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Image
            src={activeImage.src}
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, 896px"
            priority={activeIndex === 0}
          />
        )}

        {resolvedImages.length > 1 && (
          <>
            <div className="absolute inset-0 pointer-events-none bg-linear-to-t from-black/35 via-transparent to-transparent" />
            <div className="absolute inset-y-0 left-0 right-0 z-10 pointer-events-none flex items-center justify-between px-2 sm:px-3 md:px-4">
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={goPrev}
                aria-label="Previous media"
                className="pointer-events-auto bg-white/90 border-white/60 text-forest hover:bg-white hover:text-forest rounded-full shadow-sm"
              >
                <IconChevronLeft size={14} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                onClick={goNext}
                aria-label="Next media"
                className="pointer-events-auto bg-white/90 border-white/60 text-forest hover:bg-white hover:text-forest rounded-full shadow-sm"
              >
                <IconChevronRight size={14} />
              </Button>
            </div>
            <div className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-forest shadow-sm">
              {activeIsVideo ? 'Clip' : 'Photo'} {activeIndex + 1} of {resolvedImages.length}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
