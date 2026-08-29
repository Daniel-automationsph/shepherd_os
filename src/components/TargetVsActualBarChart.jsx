import { BarChart, Bar, Cell, LabelList, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const MISSED_COLOR = '#d0362a'
const GAINED_COLOR = '#a35148'
const EXCESS_COLOR = '#b3b3b3'

/**
 * Stacked bar showing, per month, whether Actual met/exceeded a constant
 * target: the base segment is colored maroon ("Target Gained") when
 * actual >= target, or red ("Target Missed") when it fell short — sized
 * to min(actual, target) either way. Any amount actual exceeded target
 * by is shown as a separate gray "Actual" segment stacked on top, so the
 * full bar height is always the real total, with the real number labeled
 * inside it.
 *
 * Unreported months are skipped (no bar) rather than shown as a
 * misleading "target missed at zero" — same convention used elsewhere.
 */
export default function TargetVsActualBarChart({ months, target, valueFormatter = (v) => Math.round(v).toString(), height = 280 }) {
  if (!months || months.length === 0) return null

  const data = months.map((m) => {
    if (m.unreported) {
      return { label: m.label, below: null, above: null, missed: false, total: null }
    }
    const missed = m.value < target
    const below = missed ? m.value : target
    const above = missed ? 0 : Math.max(0, m.value - target)
    return { label: m.label, below, above, missed, total: m.value }
  })

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 24, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={44} />
        <Tooltip
          formatter={(v, name, props) => [valueFormatter(props.payload.total), 'Actual']}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Legend
          payload={[
            { value: 'Target Missed', type: 'square', color: MISSED_COLOR },
            { value: 'Target Gained', type: 'square', color: GAINED_COLOR },
            { value: 'Actual (above target)', type: 'square', color: EXCESS_COLOR },
          ]}
          wrapperStyle={{ fontSize: 11 }}
        />
        <Bar dataKey="below" stackId="stack" isAnimationActive={false} radius={[0, 0, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.missed ? MISSED_COLOR : GAINED_COLOR} />
          ))}
          <LabelList
            dataKey="total"
            content={(props) => renderInsideLabel(props, data[props.index], valueFormatter, 'below')}
          />
        </Bar>
        <Bar dataKey="above" stackId="stack" fill={EXCESS_COLOR} isAnimationActive={false} radius={[4, 4, 0, 0]}>
          <LabelList
            dataKey="total"
            content={(props) => renderInsideLabel(props, data[props.index], valueFormatter, 'above')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// Only render the total's label on whichever segment is actually the
// TOP of that month's bar — the "above" segment when there's a visible
// excess, otherwise the "below" segment (target-missed months have no
// "above" segment at all, so labeling only "above" would silently drop
// their label entirely).
function renderInsideLabel(props, row, valueFormatter, segment) {
  const { x, y, width, height: h } = props
  if (row.total == null) return null
  const isTopSegment = segment === 'above' ? row.above > 0 : row.above === 0
  if (!isTopSegment) return null
  return (
    <text x={x + width / 2} y={y + 16} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff">
      {valueFormatter(row.total)}
    </text>
  )
}
