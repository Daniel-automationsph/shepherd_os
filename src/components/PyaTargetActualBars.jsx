import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

const PYA_COLOR = '#8095a8'
const TARGET_COLOR = '#c98a2c'
const AA_COLOR = '#2f5233'

/**
 * Small reference bar chart: PYA, Target (optional), and AA side by
 * side — a quick "where do these three numbers stand relative to each
 * other" glance, kept separate from the monthly trend line so that
 * chart isn't sharing its scale with numbers of a very different
 * magnitude (a single PYA/Target bar next to 12 months of line dots
 * flattens the line's own shape).
 */
export default function PyaTargetActualBars({ pya, target, actual, valueFormatter = (v) => Math.round(v).toString(), height = 160 }) {
  const data = [
    { label: 'PYA', value: pya, color: PYA_COLOR },
    ...(target != null ? [{ label: 'Target', value: target, color: TARGET_COLOR }] : []),
    { label: 'AA', value: actual, color: AA_COLOR },
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 4, bottom: 0, left: 4 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} />
        <YAxis hide />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false} barSize={28}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
          <LabelList dataKey="value" position="top" formatter={valueFormatter} style={{ fontSize: 10.5, fontWeight: 700, fill: 'var(--ink)' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
