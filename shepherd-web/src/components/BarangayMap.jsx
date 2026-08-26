import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import boundaries from '../data/pinamalayanBarangays.json'

/// Real barangay boundary polygons for Pinamalayan, Oriental Mindoro, sourced
/// from PSA/PSGC administrative boundary data (via faeldon/philippines-json-maps,
/// itself built from altcoder/philippines-psgc-shapefiles — official PSGC data
/// as of Dec 2023). These are REAL surveyed boundaries, not placeholders,
/// unlike the earlier point-marker version of this map.
export default function BarangayMap({ barangays, selectedName, onSelect, height = 420 }) {
  const dataByName = useMemo(() => {
    const map = {}
    for (const b of barangays) map[b.name] = b
    return map
  }, [barangays])

  const geoJsonKey = useMemo(() => JSON.stringify([selectedName, barangays.map((b) => `${b.name}:${b.reached}`)]), [
    selectedName,
    barangays,
  ])

  function style(feature) {
    const name = feature.properties.name
    const b = dataByName[name]
    const selected = name === selectedName
    const reached = b?.reached
    return {
      fillColor: reached ? '#2f7d4f' : '#d94f36',
      fillOpacity: selected ? 0.85 : reached ? 0.65 : 0.6,
      color: selected ? '#1e2a22' : reached ? '#1f5c37' : '#8f3220',
      weight: selected ? 3.5 : 1.8,
    }
  }

  function onEachFeature(feature, layer) {
    const name = feature.properties.name
    layer.bindTooltip(name, { sticky: true, direction: 'top' })
    layer.on({
      click: () => onSelect && onSelect(dataByName[name] || { name, reached: false }),
      mouseover: (e) => e.target.setStyle({ weight: 3 }),
      mouseout: (e) => e.target.setStyle(style(feature)),
    })
  }

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
      <MapContainer
        center={[13.033, 121.485]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height, width: '100%', background: 'var(--surface-muted)' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON key={geoJsonKey} data={boundaries} style={style} onEachFeature={onEachFeature} />
        <FitToBounds data={boundaries} />
      </MapContainer>
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

function LegendRow({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span className="caption">{label}</span>
    </div>
  )
}
