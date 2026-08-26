import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import AttentionTile from '../components/AttentionTile'
import { attentionItems, KPI_STATUS } from '../data/mockData'

export default function ManagementAttention() {
  const [filter, setFilter] = useState(null)

  const items = filter ? attentionItems.filter((i) => i.severity === filter) : attentionItems
  const critical = attentionItems.filter((i) => i.severity === KPI_STATUS.CRITICAL).length
  const attention = attentionItems.filter((i) => i.severity === KPI_STATUS.ATTENTION).length
  const good = attentionItems.filter((i) => i.severity === KPI_STATUS.ON_TARGET).length

  return (
    <div className="scroll-page" style={{ maxWidth: 900 }}>
      <SectionHeader title="Management Attention" subtitle="Don't make leaders search for problems. Show them the problems." />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
        <FilterChip label={`All (${attentionItems.length})`} active={filter === null} onClick={() => setFilter(null)} color="var(--primary)" />
        <FilterChip label={`Critical (${critical})`} active={filter === KPI_STATUS.CRITICAL} onClick={() => setFilter(KPI_STATUS.CRITICAL)} color="var(--status-critical)" />
        <FilterChip label={`Attention (${attention})`} active={filter === KPI_STATUS.ATTENTION} onClick={() => setFilter(KPI_STATUS.ATTENTION)} color="var(--status-attention)" />
        <FilterChip label={`On Target (${good})`} active={filter === KPI_STATUS.ON_TARGET} onClick={() => setFilter(KPI_STATUS.ON_TARGET)} color="var(--status-on-target)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <AttentionTile key={i} item={item} />
        ))}
        {items.length === 0 && <div className="body-muted" style={{ textAlign: 'center', padding: 40 }}>Nothing here right now.</div>}
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '9px 14px',
        borderRadius: 999,
        border: `1px solid ${active ? color : 'var(--line)'}`,
        background: active ? `${color}1f` : 'var(--surface)',
        color: active ? color : 'var(--ink-muted)',
        fontWeight: 700,
        fontSize: 12.5,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
