import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts'

/**
 * Grouped bar comparison — Actual vs PYA, per metric, with the real
 * number printed inside each bar. Metrics can be on very different
 * scales (e.g. weekly attendance vs total membership) — the in-bar
 * labels keep the real values readable regardless of how tall each bar
 * ends up relative to the others, so a smaller bar doesn't read as
 * "worse," just as a different kind of number.
 */
export default function GroupedPyaBarChart({ metrics, formatter = (v) => Math.round(v).toString(), height = 260 }) {
  if (!metrics || metrics.length === 0) return null

  const data = metrics.map((m) => ({ label: m.label, actual: m.actual, pya: m.pya, color: m.color }))

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 10, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--ink)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={formatter} width={56} />
        <Tooltip
          formatter={(v) => formatter(v)}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="actual" name="Actual" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
          <LabelList dataKey="actual" position="inside" formatter={formatter} style={{ fontSize: 12, fontWeight: 700, fill: '#fff' }} />
        </Bar>
        <Bar dataKey="pya" name="PYA" radius={[4, 4, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.4} />
          ))}
          <LabelList dataKey="pya" position="inside" formatter={formatter} style={{ fontSize: 12, fontWeight: 700, fill: '#fff' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    </div>
  )
}
