'use client'

import { useEffect, useState, useRef, useCallback, type FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ConfettiOverlay } from '@/components/motion/ConfettiOverlay'
import { IconLeaf, IconArrowLeft, IconMapPin, IconSatellite, IconMap } from '@tabler/icons-react'
import type { Map as LeafletMap, LayerGroup, TileLayer, LeafletMouseEvent, DivIcon, CircleMarker } from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface MarkerData {
  id: string
  lat: number
  lng: number
  label: string | null
  userId: string | null
  user?: { fullName: string } | null
  imageUrl?: string | null
}

export default function MapsPage() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const mapRef = useRef<LeafletMap | null>(null)
  const markersLayerRef = useRef<LayerGroup | null>(null)
  const treeIconRef = useRef<DivIcon | null>(null)
  const leafletRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiMessage, setConfettiMessage] = useState('')
  const [confettiType, setConfettiType] = useState<'success' | 'error'>('success')
  const [confettiAction, setConfettiAction] = useState<'redirect' | 'none'>('none')
  const [confettiRedirectUrl, setConfettiRedirectUrl] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'street' | 'satellite'>('satellite')
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [placing, setPlacing] = useState(false)
  const [pendingMarker, setPendingMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [samplingName, setSamplingName] = useState('')
  const [samplingError, setSamplingError] = useState('')
  const [samplingImage, setSamplingImage] = useState<File | null>(null)
  const [samplingPreview, setSamplingPreview] = useState<string | null>(null)
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null)
  const [savedLocation, setSavedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [shouldPromptLocation, setShouldPromptLocation] = useState(false)
  const [locationPrompted, setLocationPrompted] = useState(false)
  const userLocationMarkerRef = useRef<CircleMarker | null>(null)
  const tileLayerRef = useRef<TileLayer | null>(null)
  const [checkedAuth, setCheckedAuth] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  const showConfettiMessage = useCallback((message: string, type: 'success' | 'error' = 'error', action: 'redirect' | 'none' = 'none', redirectUrl: string | null = null) => {
    setConfettiMessage(message)
    setConfettiType(type)
    setConfettiAction(action)
    setConfettiRedirectUrl(redirectUrl)
    setShowConfetti(true)
  }, [])

  // Route protection: if not authenticated, show confetti and redirect
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' && !checkedAuth) {
      setCheckedAuth(true)
      showConfettiMessage('Please log in first!', 'error', 'redirect', '/auth')
    } else if (status === 'authenticated') {
      setCheckedAuth(true)
    }
  }, [status, checkedAuth, showConfettiMessage])

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
    if (status !== 'authenticated' || !leafletLoaded || !mapRef.current || !session?.user) return

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
            marker.bindPopup('Saved location').openPopup()
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
    if (!shouldPromptLocation || locationPrompted || status !== 'authenticated') return
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
      delete (L.Icon.Default.prototype as any)._getIconUrl
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

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || mapRef.current) return
    const L = leafletRef.current
    if (!L) return

    const map = L.map(mapContainerRef.current, {
      center: [19.0, 74.5], // Gatewadi, Maharashtra
      zoom: 14,
      zoomControl: false,
      maxZoom: 24,
      attributionControl: false,
    })

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const initialLayer = L.tileLayer(
      viewMode === 'satellite'
        ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: viewMode === 'satellite'
          ? '&copy; OpenStreetMap contributors — OSM France'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 19,
      }
    ).addTo(map)
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
  }, [leafletLoaded])

  const myMarkerCount = session?.user?.id ? markers.filter((m) => m.userId === session.user.id).length : 0

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
      // Include a small thumbnail if available
      const topBlock = m.imageUrl
        ? `<div style="display:grid;grid-template-columns:1fr auto;gap:12px;align-items:start;margin-bottom:14px;">
             <div>
               <div style="font-size:18px;font-weight:800;color:#064E3B;line-height:1.1;">${label}</div>
               <div style="font-size:11px;color:#16A34A;letter-spacing:0.12em;margin-top:4px;text-transform:uppercase;">Sampling name</div>
             </div>
             <div style="width:48px;height:48px;border-radius:20px;overflow:hidden;border:1px solid rgba(16,185,129,0.22);box-shadow:0 10px 20px rgba(15,23,42,0.1);">
               <img src="${m.imageUrl}" alt="sapling" style="width:100%;height:100%;object-fit:cover;display:block;" />
             </div>
           </div>`
        : `<div style="margin-bottom:14px;">
             <div style="font-size:18px;font-weight:800;color:#064E3B;line-height:1.1;">${label}</div>
             <div style="font-size:11px;color:#16A34A;letter-spacing:0.12em;margin-top:4px;text-transform:uppercase;">Sampling name</div>
           </div>`

      const popupContent = `
        <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; min-width:280px; background: rgba(236, 253, 245, 0.96); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 22px; padding: 18px; box-shadow: 0 26px 54px rgba(15, 50, 26, 0.18); color: #134E4A;">
          ${topBlock}
          <div style="padding:14px 0; border-top:1px solid rgba(16, 185, 129, 0.18); border-bottom:1px solid rgba(16, 185, 129, 0.18); margin:12px 0;">
            <div style="font-size:11px; color:#047857; margin-bottom:6px;">Planted by:</div>
            <div style="font-size:14px; font-weight:700; color:#0F5132;">${firstName}</div>
          </div>
          <div style="font-size:11px; color:#164E63; line-height:1.6;">
            <div style="font-weight:700; color:#0F5132; margin-bottom:4px;">Coordinates</div>
            <div>${coords}</div>
          </div>
        </div>
      `

      marker.bindPopup(popupContent, {
        maxWidth: 280,
        closeButton: false,
        className: 'leaflet-popup-custom',
      })
      marker.on('mouseover', () => marker.openPopup())
      marker.on('mouseout', () => marker.closePopup())
      marker.on('click', () => setSelectedMarker(m))
      layer.addLayer(marker)
    })
  }, [markers])

  // Switch tile layer when view mode changes
  useEffect(() => {
    const map = mapRef.current
    const L = leafletRef.current
    if (!map || !tileLayerRef.current || !L) return

    const newUrl = viewMode === 'satellite'
      ? 'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const newAttribution = viewMode === 'satellite'
      ? '&copy; OpenStreetMap contributors — OSM France'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

    map.removeLayer(tileLayerRef.current)
    const newLayer = L.tileLayer(newUrl, {
      attribution: newAttribution,
      maxNativeZoom: 19,
      maxZoom: 24,
    }).addTo(map)
    tileLayerRef.current = newLayer
  }, [viewMode])

  // Handle map click to place marker
  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    if (!placing || pendingMarker) return

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

    if (!samplingName.trim()) {
      setSamplingError('Sampling name is required.')
      return
    }

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
        setPendingMarker(null)
        setPlacing(false)
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
      }
    } catch (err) {
      console.error('Failed to save marker', err)
      const msg = (err as any)?.message || 'Failed to save marker. Please try again.'
      setSamplingError(msg)
      showConfettiMessage(msg, 'error')
    }
  }, [pendingMarker, samplingName, samplingImage, samplingPreview])

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

  const handleLogout = useCallback(() => {
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
              <h1 className="text-white font-bold text-sm">Vanashree Plantation Map</h1>
              <p className="text-white/40 text-[10px]">Click to mark where you planted</p>
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
              onClick={() => setPlacing(!placing)}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
                placing
                  ? 'bg-leaf text-white'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <IconLeaf size={14} />
              {placing ? 'Cancel' : 'Plant a Tree'}
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

          {/* Placing mode indicator */}
          {placing && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/70 backdrop-blur-md rounded-full px-5 py-2 border border-white/10 shadow-xl">
              <p className="text-white text-xs font-medium flex items-center gap-2">
                <IconLeaf size={14} className="text-leaf" />
                Click anywhere on the map to select a planting location
              </p>
            </div>
          )}

          {pendingMarker && (
            <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xl">
              <form
                onSubmit={handleCreateMarker}
                className="w-full max-w-[28rem] rounded-[32px] border border-white/10 bg-slate-950/95 p-6 shadow-[0_32px_80px_rgba(15,23,42,0.55)]"
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
                    className="inline-flex w-full items-center justify-center rounded-[24px] bg-leaf px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(22,101,52,0.3)] transition hover:bg-emerald-500 sm:w-auto"
                  >
                    Save marker
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Marker count badge */}
          <div className="absolute bottom-20 left-4 z-[1000] bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10 flex items-center gap-2">
            <IconLeaf size={14} className="text-leaf" />
            <span className="text-white/80 text-xs font-medium">{myMarkerCount} trees marked</span>
          </div>

          {/* Selected marker popup */}
          {selectedMarker && (
            <div className="absolute bottom-4 right-20 z-[1000] bg-emerald-50/95 backdrop-blur-md rounded-xl px-4 py-3 border border-emerald-200/70 shadow-xl min-w-[200px]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {selectedMarker.imageUrl && (
                    <img src={selectedMarker.imageUrl} alt="thumb" className="w-10 h-10 object-cover rounded-md" />
                  )}
                  <div>
                    <p className="text-slate-900 text-sm font-medium flex items-center gap-1.5">
                      <IconLeaf size={14} className="text-emerald-600" />
                      {selectedMarker.label || 'Unnamed Sapling'}
                    </p>
                    <p className="text-slate-600 text-xs mt-0.5">
                      Planted by {selectedMarker.user?.fullName || 'Unknown'}
                    </p>
                    <p className="text-slate-500 text-[10px] mt-1">
                      {selectedMarker.lat.toFixed(5)}, {selectedMarker.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
