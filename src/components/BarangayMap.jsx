import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import boundaries from '../data/pinamalayanBarangays.json'

// Short, unique 3-5 character identifiers shown as permanent labels
// directly on each polygon (full name shows on hover/tap instead).
// Keys must exactly match the "name" property in pinamalayanBarangays.json.
const BARANGAY_CODES = {
  Anoling: 'ANOL',
  Bacungan: 'BACU',
  Bangbang: 'BANG',
  Banilad: 'BANI',
  Buli: 'BULI',
  Cacawan: 'CACA',
  Calingag: 'CALI',
  Delrazon: 'DELR',
  Guinhawa: 'GUIN',
  Inclanay: 'INCL',
  Lumambayan: 'LUMA',
  Malaya: 'MALY',
  Maliangcog: 'MALI',
  Maningcol: 'MANI',
  Marayos: 'MARY',
  Marfrancisco: 'MARF',
  Nabuslot: 'NABU',
  Pagalagala: 'PAGA',
  Palayan: 'PALA',
  'Pambisan Malaki': 'PAMMA',
  'Pambisan Munti': 'PAMMU',
  Panggulayan: 'PANG',
  Papandayan: 'PAPA',
  Pili: 'PILI',
  Quinabigan: 'QUIN',
  Ranzo: 'RANZ',
  Rosario: 'ROSA',
  Sabang: 'SABA',
  'Sta. Isabel': 'STAI',
  'Sta. Maria': 'STAM',
  'Sta. Rita': 'STAR',
  'Sto. Niño': 'STON',
  Wawa: 'WAWA',
  'Zone I': 'ZNI',
  'Zone II': 'ZNII',
  'Zone III': 'ZNIII',
  'Zone IV': 'ZNIV',
}

/// Real barangay boundary polygons for Pinamalayan, Oriental Mindoro, sourced
/// from PSA/PSGC administrative boundary data (via faeldon/philippines-json-maps,
/// itself built from altcoder/philippines-psgc-shapefiles — official PSGC data
/// as of Dec 2023). These are REAL surveyed boundaries, not placeholders,
/// unlike the earlier point-marker version of this map.
///
/// Sized as a square (aspect-ratio 1/1) rather than a fixed pixel height —
/// this way it scales predictably on any screen width (phone, tablet,
/// desktop) instead of looking oddly stretched/cropped depending on
/// viewport, and Leaflet 1.9+ auto-detects the container resizing via
/// ResizeObserver so no manual invalidateSize() call is needed.
export default function BarangayMap({
  barangays,
  selectedName,
  onSelect,
  maxHeight = 520,
  labelMinWidth = 340,
  nameZoomThreshold = 14,
}) {
  const [listOpen, setListOpen] = useState(false)
  const [containerWidth, setContainerWidth] = useState(null)
  const [zoom, setZoom] = useState(12) // matches MapContainer's initial zoom below
  const containerRef = useRef(null)

  // Track the map's actual rendered pixel width so labels can hide
  // themselves when the map is squeezed too narrow to fit them cleanly
  // (e.g. a small phone, or a narrow sidebar placement) — rather than a
  // fixed always-on/always-off choice regardless of available space.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width
      if (width) setContainerWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Default to "show labels" before the first measurement so they don't
  // flash in then immediately disappear on initial paint.
  const fitsLabels = containerWidth === null || containerWidth >= labelMinWidth

  // Three tiers: too small to label at all → nothing (identify via tap
  // instead); normal/zoomed-out view → short code (fits many polygons at
  // once without overlapping); zoomed in far enough that each polygon has
  // real room → full name (no need to abbreviate once there's space).
  const labelMode = !fitsLabels ? 'none' : zoom >= nameZoomThreshold ? 'name' : 'code'

  const dataByName = useMemo(() => {
    const map = {}
    for (const b of barangays) map[b.name] = b
    return map
  }, [barangays])

  const sortedBarangays = useMemo(() => [...barangays].sort((a, b) => a.name.localeCompare(b.name)), [barangays])

  const reachedCount = useMemo(() => barangays.filter((b) => b.reached).length, [barangays])
  const reachPct = barangays.length === 0 ? 0 : (reachedCount / barangays.length) * 100

  function handleListSelect(b) {
    onSelect && onSelect(b)
    setListOpen(false) // collapse back to the map view so the highlighted polygon is visible
  }

  // labelMode (not raw zoom) drives the remount key, so the GeoJSON layer
  // only remounts when crossing a threshold — not on every intermediate
  // zoom tick, which would be janky and expensive to re-render for.
  const geoJsonKey = useMemo(
    () => JSON.stringify([selectedName, labelMode, barangays.map((b) => `${b.name}:${b.reached}`)]),
    [selectedName, labelMode, barangays],
  )

  function style(feature) {
    const name = feature.properties.name
    const b = dataByName[name]
    const selected = name === selectedName
    const reached = b?.reached
    const extension = b?.extensionChurch

    const fillColor = extension ? '#c98a2c' : reached ? '#2f7d4f' : '#d94f36'
    const borderColor = extension ? '#8a5f1c' : reached ? '#1f5c37' : '#8f3220'

    return {
      fillColor,
      fillOpacity: selected ? 0.85 : extension ? 0.72 : reached ? 0.65 : 0.6,
      color: selected ? '#1e2a22' : borderColor,
      weight: selected ? 3.5 : 1.8,
    }
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.name
    const code = BARANGAY_CODES[name] || name.slice(0, 4).toUpperCase()

    if (labelMode === 'name') {
      layer.bindTooltip(name, { permanent: true, direction: 'center', className: 'barangay-label barangay-label-name' })
    } else if (labelMode === 'code') {
      layer.bindTooltip(code, { permanent: true, direction: 'center', className: 'barangay-label' })
    }
    // labelMode === 'none': no permanent tooltip at all — identify via tap instead.

    layer.on({
      click: () => onSelect && onSelect(dataByName[name] || { name, reached: false }),
      mouseover: (e) => {
        e.target.setStyle({ weight: 3 })
        if (labelMode === 'code') {
          layer.setTooltipContent(name) // temporarily expand code → full name
        } else if (labelMode === 'none') {
          // No permanent label at this size — surface the name on demand
          // via a normal (non-permanent) hover tooltip instead.
          layer.bindTooltip(name, { sticky: true, direction: 'top' }).openTooltip(e.latlng)
        }
        // labelMode === 'name': already showing the full name, nothing to change.
      },
      mouseout: (e) => {
        e.target.setStyle(style(feature))
        if (labelMode === 'code') {
          layer.setTooltipContent(code) // revert to the short code
        } else if (labelMode === 'none') {
          layer.closeTooltip()
          layer.unbindTooltip()
        }
      },
    })
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--line)',
        width: '100%',
        aspectRatio: '1 / 1',
        maxHeight,
        maxWidth: maxHeight,
        margin: '0 auto',
      }}
    >
      <MapContainer
        center={[13.033, 121.485]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', background: 'var(--surface-muted)' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON key={geoJsonKey} data={boundaries} style={style} onEachFeature={onEachFeature} />
        <FitToBounds data={boundaries} />
        <ZoomWatcher onZoomChange={setZoom} />
      </MapContainer>

      {/* Floating title card — reach % computed live from whatever
          barangays were passed in, so it stays correct on both the
          Dashboard's map and the Geographic Reach screen's map without
          needing a separate prop. Stacked above the list toggle below. */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, maxWidth: 'calc(100% - 20px)' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid var(--line)',
            borderRadius: 10,
            padding: '10px 12px',
            marginBottom: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: 'var(--ink-muted)', textTransform: 'uppercase' }}>
            Geographic Reach
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2, marginTop: 2 }}>
            {reachPct.toFixed(0)}%
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-muted)', marginTop: 1 }}>
            {reachedCount} / {barangays.length} barangays
          </div>
        </div>

        <button
          onClick={() => setListOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid var(--line)',
            borderRadius: 8,
            padding: '8px 10px',
            fontSize: 11.5,
            fontWeight: 700,
            color: 'var(--ink)',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 13 }}>☰</span>
          {barangays.length} Barangays
          <span style={{ fontSize: 9, opacity: 0.6 }}>{listOpen ? '▲' : '▼'}</span>
        </button>

        {listOpen && (
          <div
            style={{
              marginTop: 6,
              background: 'rgba(255,255,255,0.97)',
              border: '1px solid var(--line)',
              borderRadius: 10,
              maxHeight: 260,
              overflowY: 'auto',
              boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
              width: 220,
              maxWidth: '100%',
            }}
          >
            {sortedBarangays.map((b) => (
              <div
                key={b.name}
                onClick={() => handleListSelect(b)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  background: b.name === selectedName ? 'var(--surface-muted)' : 'transparent',
                  fontSize: 12.5,
                }}
                onMouseEnter={(e) => {
                  if (b.name !== selectedName) e.currentTarget.style.background = 'var(--surface-muted)'
                }}
                onMouseLeave={(e) => {
                  if (b.name !== selectedName) e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: b.extensionChurch ? '#c98a2c' : b.reached ? '#2f7d4f' : '#d94f36',
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, fontWeight: b.name === selectedName ? 700 : 400 }}>{b.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: '8px 10px',
          fontSize: 11,
        }}
      >
        <LegendRow color="#c98a2c" label="Extension Church" />
        <div style={{ height: 4 }} />
        <LegendRow color="#2f7d4f" label="Reached" />
        <div style={{ height: 4 }} />
        <LegendRow color="#d94f36" label="Not reached" />
      </div>
    </div>
  )
}

function FitToBounds({ data }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (fitted.current) return
    const layer = window.L ? null : null
    // Compute bounds manually from raw GeoJSON coordinates to avoid needing
    // a mounted layer reference.
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity
    const walk = (coords, depth) => {
      if (depth === 0) {
        const [lng, lat] = coords
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
      } else {
        coords.forEach((c) => walk(c, depth - 1))
      }
    }
    for (const f of data.features) {
      const depth = f.geometry.type === 'Polygon' ? 2 : 3
      walk(f.geometry.coordinates, depth)
    }
    if (isFinite(minLat)) {
      map.fitBounds(
        [
          [minLat, minLng],
          [maxLat, maxLng],
        ],
        { padding: [16, 16] },
      )
    }
    fitted.current = true
  }, [map, data])
  return null
}

/// Lifts the map's current zoom level up to the parent BarangayMap
/// component via onZoomChange, so label mode (name vs code vs none) can
/// react to it — this needs to live inside <MapContainer> since useMap()
/// only works within Leaflet's context.
function ZoomWatcher({ onZoomChange }) {
  const map = useMap()
  useEffect(() => {
    const handleZoom = () => onZoomChange(map.getZoom())
    map.on('zoomend', handleZoom)
    handleZoom() // capture the initial zoom too, not just future changes
    return () => map.off('zoomend', handleZoom)
  }, [map, onZoomChange])
  return null
}

function LegendRow({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span className="caption">{label}</span>
    </div>
  )
}
