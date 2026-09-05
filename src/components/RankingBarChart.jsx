import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { statusFromAchievement } from '../data/api'

// Recharts needs real color strings for SVG fills, not CSS var() references
// (same issue KpiStatCard.jsx works around) — so these are resolved hex
// values matching the app's status colors, not var(--status-*) directly.
const STATUS_COLORS = {
  onTarget: '#00c781',
  attention: '#ffbb38',
  critical: '#ff4040',
}

/**
 * Horizontal bar ranking — best answers "who is performing best/worst?"
 * Bars are colored by their own achievement status (on target / attention
 * / critical), same status colors used everywhere else in the app, so a
 * ranking chart reads consistently with the rest of the UI rather than
 * introducing a new color language just for this chart.
 */
export default function RankingBarChart({ data, valueFormatter = (v) => `${v.toFixed(0)}%`, height }) {
  if (!data || data.length === 0) return null
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const chartHeight = height || Math.max(120, sorted.length * 44)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 40, bottom: 4, left: 4 }}>
        <CartesianGrid stroke="var(--line)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} />
        <YAxis type="category" dataKey="label" width={100} tick={{ fontSize: 12.5, fill: 'var(--ink)' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => valueFormatter(v)}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} isAnimationActive={false} barSize={22}>
          {sorted.map((entry, i) => {
            const status = statusFromAchievement(entry.value)
            return <Cell key={i} fill={STATUS_COLORS[status]} />
          })}
          <LabelList dataKey="value" position="right" formatter={valueFormatter} style={{ fontSize: 12, fontWeight: 700, fill: 'var(--ink)' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
