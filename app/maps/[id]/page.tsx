import { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { IconArrowLeft, IconPlus } from '@tabler/icons-react'
import { PulseDot } from '@/components/motion/PulseDot'

export const metadata: Metadata = {
  title: 'Sapling Timeline',
}

interface TimelinePageProps {
  params: Promise<{ id: string }> | { id: string }
}

function formatTimelineDate(value: Date | string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const resolvedParams = await params
  const markerId = resolvedParams.id

  if (!markerId) {
    notFound()
  }

  const guestCookie = (await cookies()).get('vanashree-guest')
  const isGuestMode = Boolean(guestCookie?.value)

  const marker = await prisma.mapMarker.findUnique({
    where: { id: markerId },
    include: {
      user: { select: { fullName: true } },
      entries: {
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      },
    },
  })

  if (!marker) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-neutral-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_60px_rgba(15,23,42,0.06)]">
          <section className="border-b border-black/6 bg-[linear-gradient(180deg,rgba(248,247,243,0.96)_0%,rgba(255,255,255,1)_100%)]">
            <div className="flex flex-col gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-start lg:justify-between lg:px-10 lg:py-10">
              <div className="max-w-2xl">
                <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">
                  Sapling Timeline
                </p>

                <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-[2.15rem]">
                  {marker.label || 'Unnamed sapling'}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/maps"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-neutral-800 transition hover:border-black/15 hover:bg-neutral-50"
                >
                  <IconArrowLeft size={16} stroke={2} />
                  Back to map
                </Link>

                {!isGuestMode && (
                  <Link
                    href={`/maps/${marker.id}/add`}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    <IconPlus size={16} stroke={2} />
                    Add update
                  </Link>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
              {marker.entries.length > 0 ? (
  <div className="space-y-5">
    {marker.entries.map((entry, index) => (
      <article key={entry.id} className="group relative pl-10">
        {index !== marker.entries.length - 1 && (
          <span className="absolute left-[11px] top-8 bottom-[-22px] w-px bg-gradient-to-b from-neutral-300 via-neutral-200 to-transparent" />
        )}

        <span className="absolute left-0 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#d7decf] bg-[#f3f7ef] shadow-[0_0_0_4px_#ffffff]">
          <span className="h-2.5 w-2.5 rounded-full bg-[#5b7f4a]" />
        </span>

        <div className="overflow-hidden rounded-[22px] border border-black/6 bg-[#fcfcfa] transition duration-200 hover:border-black/10 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col sm:flex-row">
            {entry.imageUrl ? (
              <div className="sm:w-44 sm:flex-shrink-0">
                <img
                  src={entry.imageUrl}
                  alt={entry.title}
                  className="h-48 w-full object-cover sm:h-full sm:min-h-[152px]"
                />
              </div>
            ) : (
              <div className="bg-[#f3f1eb] sm:w-44 sm:flex-shrink-0" />
            )}

            <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
              <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-[-0.02em] text-neutral-950">
                      {entry.title}
                    </h2>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {entry.status && (
                      entry.status === 'Needs Water' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                          <PulseDot />
                          Needs Water
                        </span>
                      ) : (
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          entry.status === 'Healthy' ? 'bg-green-50 text-green-700' :
                          entry.status === 'Overwatered' ? 'bg-amber-50 text-amber-700' :
                          'bg-neutral-100 text-neutral-600'
                        }`}>
                          {entry.status}
                        </span>
                      )
                    )}
                    <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
                      {formatTimelineDate(entry.date)}
                    </span>
                  </div>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-neutral-600">
                  {entry.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </article>
    ))}
  </div>
) : (
  <div className="flex min-h-[460px] items-center justify-center">
    <div className="w-full max-w-lg rounded-[30px] border border-black/5 bg-gradient-to-b from-white to-[#f8f7f3] p-10 text-center shadow-[0_12px_50px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5e8] ring-8 ring-[#f8fbf5]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#5b7f4a] text-2xl">
          🌱
        </div>
      </div>

      <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em] text-neutral-950">
        No updates exist for this sapling
      </h2>

      {!isGuestMode && (
        <div className="mt-8">
          <Link
            href={`/maps/${marker.id}/add`}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-neutral-950 px-6 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            <IconPlus size={18} stroke={2} />
            Add the first update
          </Link>
        </div>
      )}
    </div>
  </div>
)
}
            </div>

            <aside className="border-t border-black/6 bg-[#faf9f6] px-6 py-6 sm:px-8 lg:border-l lg:border-t-0 lg:px-8 lg:py-10">
              <div className="sticky top-8">
                <div className="rounded-[20px] border border-black/6 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Coordinates
                  </p>
                  <p className="mt-2 text-sm font-medium tabular-nums text-neutral-900">
                    {marker.lat.toFixed(5)}, {marker.lng.toFixed(5)}
                  </p>
                </div>
              </div>
            </aside>
          </section>
        </div>
      </div>
    </main>
  )
}