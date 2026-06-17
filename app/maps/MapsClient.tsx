'use client'

import { useEffect, useState, useRef, useCallback, type FormEvent } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ConfettiOverlay } from '@/components/motion/ConfettiOverlay'
import { IconLeaf, IconArrowLeft, IconMapPin, IconSatellite, IconMap } from '@tabler/icons-react'
import type { Map as LeafletMap, LayerGroup, TileLayer, LeafletMouseEvent, DivIcon } from 'leaflet'
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

  // If the login redirect added a `loggedIn` query param, remove it from the address bar
  useEffect(() => {
    if (searchParams.get('loggedIn')) {
      // Replace history entry to remove the query param without full reload
      router.replace('/maps', { scroll: false })
    }
  }, [searchParams, router])

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
        ? 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: viewMode === 'satellite'
          ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxNativeZoom: 19,
        maxZoom: 24,
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
      const thumbHtml = m.imageUrl ? `<img src="${m.imageUrl}" alt="thumb" style="width:44px;height:44px;object-fit:cover;border-radius:8px;margin-right:10px;">` : ''

      const popupContent = `
        <div style="font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif; min-width:230px; background: rgba(236, 253, 245, 0.98); border: 1px solid #C6F6D5; border-radius: 16px; padding: 14px; box-shadow: 0 18px 45px rgba(28, 58, 15, 0.16); color: #1C3B0F;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            ${thumbHtml}
            <div>
              <div style="font-weight:700;color:#1C3B0F;font-size:15px;">${label}</div>
              <div style="font-size:11px;color:#2F855A; margin-top:2px;">Sampling name</div>
            </div>
          </div>
          <div style="padding:10px 0;border-top:1px solid rgba(72, 187, 120, 0.18); border-bottom:1px solid rgba(72, 187, 120, 0.18); margin:8px 0;">
            <div style="font-size:11px;color:#2F855A; margin-bottom:4px;"><span style="font-weight:700;">Planted by:</span></div>
            <div style="font-size:13px;font-weight:700;color:#1C3B0F;">${firstName}</div>
          </div>
          <div style="font-size:11px;color:#4A5568; line-height:1.5;">
            <div style="font-weight:700;color:#276749; margin-bottom:4px;">Coordinates</div>
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
      ? 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    const newAttribution = viewMode === 'satellite'
      ? '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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
      // If there's an image, include it as a base64 data URL in the JSON body
      let imageData: string | undefined
      if (samplingImage) {
        // samplingPreview already holds a data URL
        imageData = samplingPreview || undefined
      }

      const res = await fetch('/api/markers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: pendingMarker.lat,
          lng: pendingMarker.lng,
          label: samplingName.trim(),
          imageData,
        }),
      })

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
  }, [pendingMarker, samplingName])

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
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      id="samplingName"
                      value={samplingName}
                      onChange={(event) => setSamplingName(event.target.value)}
                      className="flex-1 rounded-[24px] border border-slate-800 bg-slate-900/95 px-4 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20"
                      placeholder="e.g. Mango Grove #7"
                      autoFocus
                    />
                    <label className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-slate-800/60 border border-slate-700 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0] || null
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                      </svg>
                      <span className="text-[10px] text-slate-400 mt-1">Upload Photo of Sampling</span>
                    </label>
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
