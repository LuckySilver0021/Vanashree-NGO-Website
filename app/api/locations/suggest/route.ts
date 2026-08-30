import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? ''

interface MapboxContext {
  id: string
  text: string
}

interface MapboxFeature {
  id: string
  text: string
  place_type: string[]
  center: [number, number]
  context?: MapboxContext[]
}

function buildRegionLabel(context: MapboxContext[] | undefined) {
  let district = ''
  let state = ''

  for (const entry of context ?? []) {
    if (!state && entry.id.startsWith('region.')) state = entry.text
    else if (!district && entry.id.startsWith('district.')) district = entry.text
  }

  if (district && state && district !== state) return `${district}, ${state}`
  if (state) return state
  return district || ''
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] })
  }

  if (!ACCESS_TOKEN) {
    console.error('Missing NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN for location suggestions')
    return NextResponse.json({ suggestions: [] })
  }

  const params = new URLSearchParams({
    country: 'IN',
    fuzzyMatch: 'true',
    limit: '8',
    types: 'place,locality,district,neighborhood',
    language: 'en',
    access_token: ACCESS_TOKEN,
  })

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?${params.toString()}`,
      { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
    )

    if (!res.ok) {
      return NextResponse.json({ suggestions: [] })
    }

    const data = (await res.json()) as { features?: MapboxFeature[] }
    const seen = new Set<string>()

    const suggestions = (data.features ?? [])
      .filter((feature) => {
        const name = feature.text.trim()
        if (!name) return false
        const key = feature.id || name.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return Boolean(feature.center?.[0] != null && feature.center[1] != null)
      })
      .map((feature) => ({
        name: feature.text.trim(),
        region: buildRegionLabel(feature.context),
        lat: feature.center[1],
        lng: feature.center[0],
      }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('Location suggest error:', error)
    return NextResponse.json({ suggestions: [] })
  }
}