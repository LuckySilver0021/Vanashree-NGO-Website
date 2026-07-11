import { NextResponse } from 'next/server'

const isPrivateIp = (ip: string) => {
  return /^(127\.0\.0\.1|::1|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|fc00:|fe80:)/.test(ip)
}

export async function GET(request: Request) {
  try {
    const headers = request.headers
    const forwarded = headers.get('x-forwarded-for')
    const realIp = headers.get('x-real-ip')
    const candidateIp = forwarded ? forwarded.split(',')[0].trim() : realIp || undefined
    const ip = candidateIp && !isPrivateIp(candidateIp) ? candidateIp : undefined

    const targets = ip
      ? [`https://ipapi.co/${ip}/json/`, 'https://ipapi.co/json/']
      : ['https://ipapi.co/json/']

    let res: Response | null = null
    let data: any = null
    for (const target of targets) {
      res = await fetch(target, { headers: { 'User-Agent': 'VanashreeGeolocate/1.0' } })
      if (res.ok) {
        data = await res.json()
        break
      }
    }

    if (!res || !res.ok) {
      console.error('Geolocation provider error', res?.status)
      return NextResponse.json({ error: 'Geolocation provider error' }, { status: 502 })
    }

    const latitudeRaw = data.latitude ?? data.lat ?? data.latitude
    const longitudeRaw = data.longitude ?? data.lon ?? data.longitude
    const latitude = Number(latitudeRaw)
    const longitude = Number(longitudeRaw)
    const region = data.region || data.region_code || data.region_name || data.city || data.country_name || data.country || null
    const city = data.city || null
    const country = data.country_name || data.country || null

    if (Number.isNaN(latitude) || Number.isNaN(longitude) || (latitude === 0 && longitude === 0)) {
      console.error('Geolocation provider returned invalid coordinates', { latitudeRaw, longitudeRaw, ip })
      return NextResponse.json({ error: 'Geolocation provider returned invalid coordinates' }, { status: 502 })
    }

    return NextResponse.json({
      ip: ip || null,
      city,
      region,
      country,
      latitude,
      longitude,
      raw: data,
    })
  } catch (error) {
    console.error('Error in geolocate route', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
