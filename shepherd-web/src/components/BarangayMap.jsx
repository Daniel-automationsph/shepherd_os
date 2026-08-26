import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { pinamalayanCenter } from '../data/mockData'

/// Real map of Pinamalayan using OpenStreetMap tiles (no API key required).
/// Barangay coordinates in mockData are approximate placeholders — see the
/// note in src/data/mockData.js.
export default function BarangayMap({ barangays, selectedName, onSelect, height = 380 }) {
  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--line)' }}>
      <MapContainer
        center={pinamalayanCenter}
        zoom={12.2}
        scrollWheelZoom={true}
        style={{ height, width: '100%', background: 'var(--surface-muted)' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {barangays.map((b) => {
          const selected = b.name === selectedName
          const color = b.reached ? '#2f7d4f' : '#b3432d'
          return (
            <CircleMarker
              key={b.name}
              center={[b.lat, b.lng]}
              radius={selected ? 11 : 8}
              pathOptions={{
                color: selected ? '#1e2a22' : '#ffffff',
                weight: selected ? 2.5 : 2,
                fillColor: color,
                fillOpacity: b.reached ? 0.9 : 0.65,
              }}
              eventHandlers={{
                click: () => onSelect && onSelect(b),
              }}
            >
              <LeafletTooltip direction="top" offset={[0, -8]}>
                {b.name}
              </LeafletTooltip>
            </CircleMarker>
          )
        })}
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
        <LegendRow color="#b3432d" label="Not reached" />
      </div>
    </div>
  )
}

function LegendRow({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span className="caption">{label}</span>
    </div>
  )
}
