'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import type { GalleryImage } from '@/lib/gallery'
import { IconX, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

interface Category {
  key: string
  label: string
}

interface GalleryGridProps {
  images: GalleryImage[]
  categories: readonly Category[]
}

export function GalleryGrid({ images, categories }: GalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    activeCategory === 'all'
      ? images
      : images.filter((img) => img.category === activeCategory)

  const openLightbox = useCallback((idx: number) => setLightboxIndex(idx), [])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])
  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filtered.length) % filtered.length : null
    )
  }, [filtered.length])
  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filtered.length : null
    )
  }, [filtered.length])

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.key
          const count =
            cat.key === 'all'
              ? images.length
              : images.filter((img) => img.category === cat.key).length
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white text-stone border border-moss/20 hover:border-leaf/40 hover:text-forest'
              }`}
            >
              {cat.label}
              <span
                className={`ml-1.5 text-xs ${
                  isActive ? 'text-white/70' : 'text-pebble'
                }`}
              >
                ({count})
              </span>
            </button>
          )
        })}
      </div>

      {/* Image count */}
      <p className="text-sm text-pebble mb-6 text-center">
        Showing {filtered.length} of {images.length} photos
      </p>

      {/* Masonry-style grid */}
      <motion.div
        layout
        className="columns-2 md:columns-3 gap-4 md:gap-5 space-y-4 md:space-y-5"
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((img, idx) => (
            <motion.div
              key={img.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="break-inside-avoid cursor-pointer group"
              onClick={() => openLightbox(idx)}
            >
              <div className="relative rounded-2xl overflow-hidden border border-moss/20 shadow-sm hover:shadow-xl transition-shadow duration-300">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-forest/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <Badge className="bg-white/90 text-forest border-0 text-[10px] font-semibold uppercase tracking-wider">
                    {img.category}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bark/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Close lightbox"
            >
              <IconX size={20} />
            </button>

            {/* Prev button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Previous image"
            >
              <IconChevronLeft size={22} />
            </button>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
              aria-label="Next image"
            >
              <IconChevronRight size={22} />
            </button>

            {/* Image */}
            <motion.div
              key={filtered[lightboxIndex].src}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={filtered[lightboxIndex].src}
                alt={filtered[lightboxIndex].alt}
                width={filtered[lightboxIndex].width}
                height={filtered[lightboxIndex].height}
                className="max-h-[85vh] w-auto h-auto rounded-xl object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>

            {/* Caption & counter */}
            <div className="absolute bottom-4 md:bottom-6 left-0 right-0 text-center">
              <p className="text-white/80 text-sm mb-1">
                {filtered[lightboxIndex].alt}
              </p>
              <p className="text-white/40 text-xs">
                {lightboxIndex + 1} / {filtered.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
