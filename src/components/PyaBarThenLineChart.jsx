import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * PYA shown as a standalone bar (first category), the real monthly
 * series shown as a connected line for the months after it — a
 * deliberate mix of chart types in one chart: PYA is a single reference
 * number (a bar fits), the monthly trend is a progression over time (a
 * line fits better than 12 more bars).
 *
 * Built as one ComposedChart with a Bar series that only has a value at
 * the "PYA" category (null everywhere else) and a Line series that only
 * has values at the month categories (null at "PYA") — Recharts renders
 * each series only where its own dataKey has a real value, so the two
 * naturally sit side by side without extra positioning logic.
 */
export default function PyaBarThenLineChart({ pya, months, color = 'var(--primary)', valueFormatter = (v) => Math.round(v).toString(), height = 240 }) {
  if (!months || months.length === 0) return null

  const data = [
    { label: 'PYA', pyaBar: pya, trendLine: null },
    ...months.map((m) => ({
      label: m.label,
      pyaBar: null,
      trendLine: m.unreported ? null : m.value,
    })),
  ]

  const barColor = '#8095a8' // muted — a reference baseline, distinct from the trend's own color

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={44} />
        <Tooltip
          formatter={(v, name) => [v == null ? 'Not yet reported' : valueFormatter(v), name === 'pyaBar' ? 'PYA' : 'Actual']}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="pyaBar" name="PYA" fill={barColor} radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false} />
        <Line type="monotone" dataKey="trendLine" name="Actual" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color }} isAnimationActive={false} connectNulls={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
