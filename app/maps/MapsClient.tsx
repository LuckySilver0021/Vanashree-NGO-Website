'use client'

import { useEffect, useState, useRef, useCallback, type FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ConfettiOverlay } from '@/components/motion/ConfettiOverlay'
import { clearGuestModeCookie, hasGuestModeCookie } from '@/lib/auth'
import { IconLeaf, IconArrowLeft, IconMapPin, IconSatellite, IconMap, IconPencil, IconPlus } from '@tabler/icons-react'
import type { Map as LeafletMap, LayerGroup, TileLayer, LeafletMouseEvent, DivIcon, CircleMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface TimelineEntry {
  id: string
  title: string
  description: string
  imageUrl?: string | null
  date: string
  createdAt: string
}

interface MarkerData {
  id: string
  lat: number
  lng: number
  label: string | null
  userId: string | null
  user?: { fullName: string } | null
  imageUrl?: string | null
  latestEntry?: TimelineEntry | null
}

/* ── Mapbox tile configuration ──────────────────────────────────────
 * Mapbox only — no fallback providers.
 * Get a free token at https://account.mapbox.com/access-tokens/
 */
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() || ''

if (!MAPBOX_TOKEN) {
  console.warn('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN not set. Maps will not render.')
}

/* Street tiles — Mapbox Outdoors v12 @2x (crisp at high zoom) */
const STREET_TILE_URL = `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`

const STREET_ATTRIBUTION = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'

/* Satellite tiles — Mapbox Satellite v9 @2x */
const SATELLITE_TILE_URL = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`

const SATELLITE_ATTRIBUTION = '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'

/* ── Zoom constants ────────────────────────────────
 * Mapbox 512@2x tiles are sharp up to z22.
 * At the Gatewadi latitude (~19°N) z22 ≈ 1.1 m/pixel.
 * For even finer grain we allow z23–z25 via standard over-zoom.
 */
const MAX_MAP_ZOOM = 25
const MIN_MAP_ZOOM = 3
const MAX_NATIVE_ZOOM = 22   // highest zoom at which tiles are natively crisp

export default function MapsPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const mapRef = useRef<LeafletMap | null>(null)
  const markersLayerRef = useRef<LayerGroup | null>(null)
  const treeIconRef = useRef<DivIcon | null>(null)
  const leafletRef = useRef<typeof import('leaflet') | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiMessage, setConfettiMessage] = useState('')
  const [confettiType, setConfettiType] = useState<'success' | 'error'>('success')
  const [confettiAction, setConfettiAction] = useState<'redirect' | 'none'>('none')
  const [confettiRedirectUrl, setConfettiRedirectUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'street' | 'satellite'>('street')
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [placing, setPlacing] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [samplingName, setSamplingName] = useState('')
  const [samplingError, setSamplingError] = useState('')
  const [samplingImage, setSamplingImage] = useState<File | null>(null)
  const [samplingPreview, setSamplingPreview] = useState<string | null>(null)
  const [isSavingMarker, setIsSavingMarker] = useState(false)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null)
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [shouldPromptLocation, setShouldPromptLocation] = useState(false)
  const [locationPrompted, setLocationPrompted] = useState(false)
  const userLocationMarkerRef = useRef<CircleMarker | null>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [guestMode, setGuestMode] = useState(() => hasGuestModeCookie())
  const [guestNoticeVisible, setGuestNoticeVisible] = useState(false)
  const [guestNoticeFading, setGuestNoticeFading] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const showConfettiMessage = useCallback((message: string, type: 'success' | 'error' = 'error', action: 'redirect' | 'none' = 'none', redirectUrl: string | null = null) => {
    setConfettiMessage(message)
    setConfettiType(type)
    setConfettiAction(action)
    setConfettiRedirectUrl(redirectUrl)
    setShowConfetti(true)
  }, [])

  useEffect(() => {
    const cookieGuestMode = hasGuestModeCookie()
    setGuestMode(cookieGuestMode)
  }, [])

  useEffect(() => {
    if (!guestMode) {
      setGuestNoticeVisible(false)
      setGuestNoticeFading(false)
      return
    }

    setGuestNoticeVisible(true)
    setGuestNoticeFading(false)

    const fadeTimer = window.setTimeout(() => setGuestNoticeFading(true), 4000)
    const hideTimer = window.setTimeout(() => setGuestNoticeVisible(false), 5000)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [guestMode])

  useEffect(() => {
    if (guestMode) {
      setViewMode('street')
    }
  }, [guestMode])

  // Route protection: if not authenticated, show confetti and redirect
  useEffect(() => {
    if (status === 'loading') return

    if (guestMode) {
      setCheckedAuth(true)
      return
    }

    if (status === 'unauthenticated' && !checkedAuth) {
      setCheckedAuth(true)
      showConfettiMessage('Please log in first!', 'error', 'redirect', '/auth')
    } else if (status === 'authenticated') {
      setCheckedAuth(true)
    }
  }, [status, checkedAuth, guestMode, showConfettiMessage])

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false)
    if (confettiAction === 'redirect' && confettiRedirectUrl) {
      router.replace(confettiRedirectUrl, { scroll: false })
    }
  }, [confettiAction, confettiRedirectUrl, router])


  // Fetch existing markers
  useEffect(() => {
    fetch('/api/markers')
      .then((res) => res.json())
      .then((data) => {
        if (data.markers) setMarkers(data.markers)
      })
      .catch((err) => {
        console.error('Failed to load markers', err)
        showConfettiMessage('Failed to load map markers', 'error')
      })
  }, [])

  // If the login redirect added a `loggedIn` query param, just remove it from the address bar
  useEffect(() => {
    if (searchParams.get('loggedIn')) {
      router.replace('/maps', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    const selectedId = searchParams.get('selected')
    if (!selectedId || markers.length === 0) return

    const selected = markers.find((marker) => marker.id === selectedId)
    if (!selected) return

    setSelectedMarker(selected)
    const map = mapRef.current
    if (map) {
      map.setView([selected.lat, selected.lng], 17, { animate: true })
    }
  }, [markers, searchParams])

  useEffect(() => {
    if (status !== 'authenticated' || guestMode || !leafletLoaded || !mapRef.current || !session?.user) return

    const userKey = session.user.id ?? session.user.email
    if (!userKey) return

    const storageKey = `vanashree-user-location:${userKey}`
    const raw = localStorage.getItem(storageKey)

    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
          setSavedLocation(parsed)
          const map = mapRef.current
          map.setView([parsed.lat, parsed.lng], 15)

          const L = leafletRef.current
          if (L) {
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove()
            }
            const marker = L.circleMarker([parsed.lat, parsed.lng], {
              radius: 8,
              color: '#166534',
              fillColor: '#BBF7D0',
              fillOpacity: 0.9,
              weight: 2,
            }).addTo(map)
            userLocationMarkerRef.current = marker
            marker.bindPopup('Your location').openPopup()
          }
          setLocationPrompted(true)
          return
        }
      } catch {
        // ignore invalid saved value and prompt again
      }
    }

    setShouldPromptLocation(true)
  }, [status, leafletLoaded, session?.user, showConfettiMessage])

  useEffect(() => {
    if (!shouldPromptLocation || locationPrompted || status !== 'authenticated' || guestMode) return
    if (!leafletLoaded || !mapRef.current || !session?.user) return

    const userKey = session.user.id ?? session.user.email
    if (!userKey) return

    const storageKey = `vanashree-user-location:${userKey}`

    if (!navigator?.geolocation) {
      setLocationPrompted(true)
      showConfettiMessage('Geolocation is not available in this browser', 'error')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const map = mapRef.current

        if (map) {
          map.setView([lat, lng], 15)
          const L = leafletRef.current

          if (L) {
            if (userLocationMarkerRef.current) {
              userLocationMarkerRef.current.remove()
            }
            const marker = L.circleMarker([lat, lng], {
              radius: 8,
              color: '#166534',
              fillColor: '#BBF7D0',
              fillOpacity: 0.9,
              weight: 2,
            }).addTo(map)
            userLocationMarkerRef.current = marker
            marker.bindPopup('Your current location').openPopup()
          }
          localStorage.setItem(storageKey, JSON.stringify({ lat, lng }))
          setSavedLocation({ lat, lng })
          showConfettiMessage('Showing your current location on the map', 'success')
        }

        setLocationPrompted(true)
      },
      (error) => {
        console.warn('Geolocation permission denied or unavailable', error)
        showConfettiMessage('Location request denied. Showing default map view.', 'error')
        setLocationPrompted(true)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    )
  }, [shouldPromptLocation, locationPrompted, status, leafletLoaded, session?.user, showConfettiMessage])

  // Load Leaflet on the client only
  useEffect(() => {
    if (typeof window === 'undefined') return

    import('leaflet').then((L) => {
      leafletRef.current = L
      const defaultIconPrototype = L.Icon.Default.prototype as typeof L.Icon.Default.prototype & { _getIconUrl?: unknown }
      delete defaultIconPrototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      treeIconRef.current = new L.DivIcon({
        className: 'tree-marker',
        html: '<img src="/images/map-tree-marker.svg" alt="Tree" style="width:32px;height:42px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));" />',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        popupAnchor: [0, -42],
      })

      setLeafletLoaded(true)
    })
  }, [])

  // Build tile URL for the current view mode
  const getTileUrl = useCallback((mode: 'street' | 'satellite') => {
    return mode === 'satellite' ? SATELLITE_TILE_URL : STREET_TILE_URL
  }, [])

  const getTileAttribution = useCallback((mode: 'street' | 'satellite') => {
    return mode === 'satellite' ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION
  }, [])

  // Create a tile layer with proper high-zoom settings for Mapbox 512@2x tiles
  const createTileLayer = useCallback((mode: 'street' | 'satellite', L: typeof import('leaflet')) => {
    return L.tileLayer(getTileUrl(mode), {
      attribution: getTileAttribution(mode),
      maxNativeZoom: MAX_NATIVE_ZOOM,
      maxZoom: MAX_MAP_ZOOM,
      tileSize: 512,
      zoomOffset: -1,   // Mapbox 512@2x tiles need -1 offset for correct zoom level correspondence
      zoomReverse: false,
      updateWhenZooming: true,
      updateWhenIdle: true,
      keepBuffer: 16,
    })
  }, [getTileUrl, getTileAttribution])

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return
    const L = leafletRef.current
    if (!L) return

    const map = L.map(mapContainerRef.current, {
      center: [19.0, 74.5], // Gatewadi, Maharashtra
      zoom: 16,
      zoomControl: false,
      minZoom: MIN_MAP_ZOOM,
      maxZoom: MAX_MAP_ZOOM,
      // ── Precision zoom settings ──
      // zoomSnap: fractional zoom steps for smooth transitions
      // At the max, user can quarter-step between levels for fine-grained control
      zoomSnap: 0.25,
      zoomDelta: 0.25,
      wheelPxPerZoomLevel: 60,      // slower zoom = more precise control per scroll tick
      wheelDebounceTime: 30,
      scrollWheelZoom: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      attributionControl: false,
      preferCanvas: true,
      inertia: true,
      inertiaDeceleration: 3000,
      inertiaMaxSpeed: 1500,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const initialLayer = createTileLayer(viewMode, L).addTo(map)
    tileLayerRef.current = initialLayer

    const layerGroup = L.layerGroup().addTo(map)
    markersLayerRef.current = layerGroup

    mapRef.current = map

    // Detect user's approximate location using server-side analyzer (no device geolocation prompt)
    const detectAndCenter = async () => {
      try {
        const res = await fetch('/api/geolocate')
        if (!res.ok) throw new Error('Geolocation failed')
        const data = await res.json()
        const lat = data.latitude == null ? NaN : Number(data.latitude)
        const lon = data.longitude == null ? NaN : Number(data.longitude)
        const region = data.region || data.city || data.country || 'your area'
        if (!Number.isNaN(lat) && !Number.isNaN(lon) && map) {
          map.setView([lat, lon], 13)
          if (window.showAppMessage) window.showAppMessage(`Centered to ${region}`, 'success', 1800)
        } else {
          if (window.showAppMessage) window.showAppMessage('Could not determine approximate location', 'error', 2500)
        }
      } catch (err) {
        console.warn('Geolocation API failed', err)
        if (window.showAppMessage) window.showAppMessage('Could not determine approximate location', 'error', 2500)
      }
    }

    detectAndCenter()

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [leafletLoaded, viewMode, createTileLayer])

  const myMarkerCount = session?.user?.id ? markers.filter((m) => m.userId === session.user.id).length : 0
  const canAddMarkers = status === 'authenticated' && !guestMode
  const headerTitle = guestMode ? 'Vanashree Facility Map' : 'Vanashree Plantation Map'
  const headerSubtitle = guestMode ? 'Viewing existing saplings in guest mode' : 'Click to mark where you planted'

  // Render markers on map
  useEffect(() => {
    const layer = markersLayerRef.current
    if (!layer) return

    layer.clearLayers()

    const L = leafletRef.current
    const treeIcon = treeIconRef.current
    if (!L || !treeIcon) return

    markers.forEach((m) => {
      const marker = L.marker([m.lat, m.lng], { icon: treeIcon })
      const fullName = m.user?.fullName?.trim() || 'Unknown Contributor'
      const firstName = fullName.split(' ')[0] || 'Contributor'
      const label = m.label || 'Unnamed Sapling'
      const coords = `${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}`
      const latest = m.latestEntry
      const latestBlock = latest
        ? `<div style="margin-bottom:14px;">
             <div style="font-size:15px;font-weight:700;color:#064E3B;line-height:1.2;">Latest update</div>
             <div style="font-size:13px;color:#0F766E;margin-top:6px;font-weight:700;">${latest.title}</div>
             <div style="font-size:11px;color:#0F5132;margin-top:8px;max-height:4.4em;overflow:hidden;text-overflow:ellipsis;">${latest.description}</div>
             <div style="font-size:11px;color:#047857;margin-top:10px;">${new Date(latest.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
           </div>`
        : `<div style="margin-bottom:14px;">
             <div style="font-size:15px;font-weight:700;color:#064E3B;line-height:1.2;">No timeline updates yet</div>
             <div style="font-size:12px;color:#0F766E;margin-top:6px;">Add the first update to capture progress.</div>
           </div>`

      const timelineActions = `
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px;">
          <a href="/maps/${m.id}" style="flex:1 1 auto;padding:10px 14px;border-radius:999px;border:1px solid rgba(15,119,110,0.18);background:rgba(255,255,255,0.96);color:#07564C;text-decoration:none;font-size:12px;font-weight:700;">View entire timeline</a>
          ${session?.user?.id === m.userId && !guestMode ? `<a href="/maps/${m.id}/add" style="flex:1 1 auto;padding:10px 14px;border-radius:999px;background:#16A34A;color:#fff;text-decoration:none;font-size:12px;font-weight:700;">+ Add update</a>` : ''}
        </div>
      `

      const popupContent = `
        <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; min-width:300px; background: rgba(236, 253, 245, 0.96); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 22px; padding: 18px; box-shadow: 0 26px 54px rgba(15, 50, 26, 0.18); color: #134E4A;">
          <div style="margin-bottom:14px;">
            <div style="font-size:18px;font-weight:800;color:#064E3B;line-height:1.1;">${label}</div>
            <div style="font-size:11px;color:#16A34A;letter-spacing:0.12em;margin-top:4px;text-transform:uppercase;">Sapling overview</div>
          </div>
          <div style="height:1px; background: rgba(16, 185, 129, 0.16); margin: 0 0 14px; border-radius: 999px;"></div>
          ${latestBlock}
          <div style="padding:14px 0; border-top:1px solid rgba(16, 185, 129, 0.18); border-bottom:1px solid rgba(16, 185, 129, 0.18); margin:12px 0;">
            <div style="font-size:11px; color:#047857; margin-bottom:6px;">Planted by:</div>
            <div style="font-size:14px; font-weight:700; color:#0F5132;">${firstName}</div>
          </div>
          <div style="font-size:11px; color:#164E63; line-height:1.6;">
            <div style="font-weight:700; color:#0F5132; margin-bottom:4px;">Coordinates</div>
            <div>${coords}</div>
          </div>
          ${timelineActions}
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        closeButton: false,
        className: 'leaflet-popup-custom',
      })

      // Always open popup on hover
      marker.on('mouseover', () => marker.openPopup())

      // Only close popup on mouseout if this marker is not currently selected
      marker.on('mouseout', () => {
        if (!selectedMarker || selectedMarker.id !== m.id) {
          marker.closePopup()
        }
      })

      // Clicking selects the marker and keeps its popup open
      marker.on('click', () => {
        setSelectedMarker(m)
        marker.openPopup()
      })

      // If this marker is the currently selected one, ensure its popup is open
      if (selectedMarker && selectedMarker.id === m.id) {
        marker.openPopup()
      }
      layer.addLayer(marker)
    })
  }, [markers, selectedMarker])

  // Switch tile layer when view mode changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !tileLayerRef.current) return

    // Re-create tile with the new view mode
    const L = leafletRef.current
    if (!L) return

    map.removeLayer(tileLayerRef.current)
    const newLayer = createTileLayer(viewMode, L).addTo(map)
    tileLayerRef.current = newLayer
  }, [viewMode, createTileLayer])

  // Handle map click to place marker
  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    if (!placing || pendingMarker || !canAddMarkers) return

    const { lat, lng } = e.latlng
    setPendingMarker({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) })
    setSamplingName('')
    setSamplingError('')
    setSamplingImage(null)
    setSamplingPreview(null)
  }, [placing, pendingMarker])

  const handleCreateMarker = useCallback(async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pendingMarker) return

    if (!canAddMarkers) {
      setSamplingError('Guest users can only view existing saplings.')
      showConfettiMessage('Guest users can only view existing saplings.', 'error')
      return
    }

    if (!samplingName.trim()) {
      setSamplingError('Sampling name is required.')
      return
    }

    setIsSavingMarker(true)
    setSamplingError('')
    setPendingMarker(null)
    setPlacing(false)

    try {
      console.log('creating marker request with image', {
        samplingImageExists: !!samplingImage,
        samplingImageName: samplingImage?.name,
        samplingImageType: samplingImage?.type,
        samplingImageSize: samplingImage?.size,
      })

      const formData = new FormData()
      formData.append('lat', String(pendingMarker.lat))
      formData.append('lng', String(pendingMarker.lng))
      formData.append('label', samplingName.trim())

      let uploadImage: File | null = samplingImage
      if (!uploadImage) {
        const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="image"]')
        uploadImage = input?.files?.[0] || null
      }

      if (uploadImage) {
        formData.append('image', uploadImage)
      }

      console.log('sending image with create request', {
        uploadImageExists: !!uploadImage,
        uploadImageName: uploadImage?.name,
        uploadImageType: uploadImage?.type,
        uploadImageSize: uploadImage?.size,
      })

      const res = await fetch('/api/markers', {
        method: 'POST',
        body: formData,
      })

      console.log('marker upload response status', res.status)
      const responseBody = await res.clone().json().catch(() => null)
      console.log('marker upload response body', responseBody)

      if (res.ok) {
        const data = await res.json()
        // Use server-provided imageUrl, or fall back to local preview so thumbnail appears immediately
        const added = { ...(data.marker || {}), imageUrl: data.marker?.imageUrl || samplingPreview || null }
        setMarkers((prev) => [added, ...prev])
        setSamplingName('')
        setSamplingImage(null)
        setSamplingPreview(null)
        setSamplingError('')
        showConfettiMessage('Marker saved', 'success')
      } else {
        const err = await res.json()
        const msg = err.error || 'Failed to save marker.'
        setSamplingError(msg)
        showConfettiMessage(msg, 'error')
        setPendingMarker(pendingMarker)
        setPlacing(true)
      }
    } catch (err) {
      console.error('Failed to save marker', err)
      const msg = err instanceof Error ? err.message : 'Failed to save marker. Please try again.'
      setSamplingError(msg)
      showConfettiMessage(msg, 'error')
      setPendingMarker(pendingMarker)
      setPlacing(true)
    } finally {
      setIsSavingMarker(false)
    }
  }, [pendingMarker, samplingName, samplingImage, samplingPreview, canAddMarkers, showConfettiMessage])

  const handleCancelMarker = useCallback(() => {
    setPendingMarker(null)
    setSamplingName('')
    setSamplingError('')
    setPlacing(false)
    setSamplingImage(null)
    setSamplingPreview(null)
  }, [])

  // Attach click handler to map
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (placing) {
      map.on('click', handleMapClick)
      map.getContainer().style.cursor = 'crosshair'
    } else {
      map.off('click', handleMapClick)
      map.getContainer().style.cursor = ''
    }

    return () => {
      map.off('click', handleMapClick)
      map.getContainer().style.cursor = ''
    }
  }, [placing, handleMapClick])

  // Deselect selected marker when clicking on map background (not placing)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const onMapClick = () => {
      if (!placing) setSelectedMarker(null)
    }

    map.on('click', onMapClick)
    return () => { map.off('click', onMapClick) }
  }, [placing])

  const handleLogout = useCallback(() => {
    clearGuestModeCookie()
    signOut({ callbackUrl: '/' })
  }, [])

  // Don't render anything if auth check hasn't completed
  if (status === 'loading' || (status === 'unauthenticated' && showConfetti)) {
    return (
      <section className="h-dvh flex items-center justify-center bg-forest">
        {showConfetti && (
          <ConfettiOverlay
            message={confettiMessage}
            type={confettiType}
            duration={2500}
            onComplete={handleConfettiComplete}
          />
        )}
      </section>
    )
  }

  return (
    <>
      {showConfetti && (
        <ConfettiOverlay
          message={confettiMessage}
          type={confettiType}
          duration={2500}
          onComplete={handleConfettiComplete}
        />
      )}

      <section className="h-dvh bg-forest relative flex flex-col">
        {/* Header — no pt-16 since Navbar is hidden */}
        <div className="relative z-20 px-4 md:px-6 py-3 flex items-center justify-between bg-forest/95 backdrop-blur-md border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-leaf/20 flex items-center justify-center">
              <IconMapPin size={18} className="text-leaf" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-sm">{headerTitle}</h1>
              <p className="text-white/40 text-[10px]">{headerSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'satellite' ? 'street' : 'satellite')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              {viewMode === 'satellite' ? (
                <><IconMap size={14} /> Street</>
              ) : (
                <><IconSatellite size={14} /> Satellite</>
              )}
            </button>

            {/* Place marker button */}
            <button
              onClick={() => {
                if (!canAddMarkers) {
                  showConfettiMessage('Guest users can only view existing saplings.', 'error')
                  return
                }
                setPlacing(!placing)
              }}
              disabled={!canAddMarkers}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                placing
                  ? 'bg-leaf text-white'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              } ${!canAddMarkers ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <IconLeaf size={14} />
              {canAddMarkers ? (placing ? 'Cancel' : 'Plant a Tree') : 'Guest view'}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg transition-colors ml-1"
            >
              <IconArrowLeft size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative min-h-0">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {guestMode && guestNoticeVisible && (
            <div className={`absolute top-16 left-1/2 -translate-x-1/2 z-1000 bg-amber-500/90 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-xl transition-opacity duration-1000 ${guestNoticeFading ? 'opacity-0' : 'opacity-100'}`}>
              <p className="text-white text-xs font-medium">In Guest mode you can only view existing saplings, but you cannot add new ones.</p>
            </div>
          )}

          {/* Placing mode indicator */}
          {placing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-black/70 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-xl">
              <p className="text-white text-xs font-medium flex items-center gap-2">
                <IconLeaf size={14} className="text-leaf" />
                Click anywhere on the map to select a planting location
              </p>
            </div>
          )}

          {pendingMarker && (
            <div className="absolute inset-0 z-1100 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xl">
              <form
                onSubmit={handleCreateMarker}
                className="w-full max-w-md rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_32px_80px_rgba(15,23,42,0.55)]"
              >
                <div className="mb-5">
                  <p className="text-white text-xl font-semibold tracking-tight">New planting marker</p>
                  <p className="text-slate-400 text-sm mt-1 leading-6">Label this location with a meaningful sampling name to keep your plantation map organized.</p>
                </div>

                <div className="rounded-[24px] border border-slate-800 bg-slate-900/95 p-4 text-slate-300 mb-5">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Location coordinates</p>
                  <p className="mt-2 text-sm text-white">{pendingMarker.lat.toFixed(6)}, {pendingMarker.lng.toFixed(6)}</p>
                </div>

                <label className="block">
                  <span className="text-slate-300 text-xs font-medium uppercase tracking-[0.18em]">Sampling name</span>
                  <input
                    id="samplingName"
                    value={samplingName}
                    onChange={(event) => setSamplingName(event.target.value)}
                    className="mt-3 block w-full rounded-[24px] border border-slate-800 bg-slate-900/95 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
                    placeholder="e.g. Mango Grove #7"
                    autoFocus
                  />
                </label>

                <label className="block mt-5">
                  <span className="text-slate-300 text-xs font-medium uppercase tracking-[0.18em]">Photo (optional)</span>
                  <div className="mt-3 flex flex-col gap-4">
                    <label className="flex items-center gap-3 rounded-[24px] border border-dashed border-slate-700 bg-slate-900/60 px-5 py-4 cursor-pointer hover:border-leaf/50 hover:bg-slate-900/80 transition-colors">
                      <input
                        type="file"
                        name="image"
                        id="samplingImage"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
                          console.log('sampling image selected', {
                            fileExists: !!f,
                            name: f?.name,
                            type: f?.type,
                            size: f?.size,
                          })
                          setSamplingImage(f)
                          if (f) {
                            const reader = new FileReader()
                            reader.onload = () => setSamplingPreview(String(reader.result))
                            reader.readAsDataURL(f)
                          } else {
                            setSamplingPreview(null)
                          }
                        }}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M3 16l3.5-5 3 3 4-5 5.5 7" />
                        <path d="M20 21H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v14a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-slate-400">
                        {samplingImage ? samplingImage.name : 'Upload a photo of the sapling'}
                      </span>
                    </label>
                    {samplingPreview && (
                      <div className="w-full rounded-[24px] overflow-hidden border border-slate-700">
                        <img src={samplingPreview} alt="preview" className="w-full h-52 object-cover" />
                      </div>
                    )}
                  </div>
                </label>
                {samplingError && (
                  <p className="mt-3 text-rose-400 text-xs">{samplingError}</p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleCancelMarker}
                    className="inline-flex w-full items-center justify-center rounded-[24px] border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10 sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingMarker}
                    className={`inline-flex w-full items-center justify-center rounded-[24px] bg-leaf px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(22,101,52,0.3)] transition hover:bg-emerald-500 sm:w-auto ${isSavingMarker ? 'cursor-not-allowed opacity-70' : ''}`}
                  >
                    {isSavingMarker ? 'Saving...' : 'Save marker'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Marker count badge */}
          <div className="absolute bottom-20 left-4 z-1000 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center gap-2">
            <IconLeaf size={14} className="text-leaf" />
            <span className="text-white/80 text-xs font-medium">{myMarkerCount} trees marked</span>
          </div>

          {/* Selected marker popup removed — Leaflet popups are used instead */}
        </div>
      </section>
    </>
  )
}
