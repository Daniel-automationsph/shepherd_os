import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

/**
 * Bar chart: first bar is PYA (Previous Year Accomplishment, shown as a distinct
 * reference bar), followed by one bar per month of the real monthly
 * series. The not-yet-reported month (if any) is shown in a lighter,
 * dashed-border style rather than a plain zero bar, so it doesn't read
 * as "activity dropped to zero" when it actually just hasn't happened
 * yet.
 */
export default function PyaBarChart({ pya, months, color = 'var(--primary)', valueFormatter, height = 220 }) {
  if (!months || months.length === 0) return null

  const data = [
    { label: 'PYA', value: pya, isPya: true },
    ...months.map((m) => ({ label: m.label, value: m.value, isPya: false, unreported: m.unreported })),
  ]

  const pyaColor = '#969696' // muted gray-blue — a reference baseline, not "this month's performance"
  const unreportedColor = '#e1e1e1' // very light — reads as "no data yet," not "zero activity"

  return (
    <div style={{ margin: '8px 0 16px' }}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={44} />
          <ReferenceLine y={pya} stroke={pyaColor} strokeDasharray="4 4" strokeWidth={1.5} />
          <Tooltip
            formatter={(v, name, props) => [
              valueFormatter ? valueFormatter(v) : v,
              props.payload.isPya ? 'PYA' : props.payload.unreported ? 'Not yet reported' : 'Actual',
            ]}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isPya ? pyaColor : entry.unreported ? unreportedColor : color}
                stroke={entry.unreported ? 'var(--ink-faint)' : 'none'}
                strokeDasharray={entry.unreported ? '3 2' : undefined}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
