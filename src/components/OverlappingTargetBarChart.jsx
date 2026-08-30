import { BarChart, Bar, Cell, LabelList, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY2_COLOR = '#c9cdd3'
const PYA_COLOR = '#2f7ed8'
const TARGET_PASSED_COLOR = '#1fa864'
const TARGET_MISSED_COLOR = '#e14b3f'

/**
 * "SSA bar inside Category 2 bar": a genuinely STACKED bar, not two
 * independent bars — Recharts groups independent (non-stacked) Bar
 * series side-by-side no matter what width you give them, so true
 * visual nesting has to be built as a stack instead:
 *   - bottom segment ("front") = SSA's actual value, colored by whether
 *     it passed the target (green) or missed it (red)
 *   - top segment ("remainder") = Category 2's value MINUS SSA's value —
 *     the "extra height" of Category 2 above SSA, shown in gray
 * Combined stack height = Category 2's real total, with SSA's own
 * portion clearly visible at the bottom in its own color. If SSA's value
 * exceeds Category 2's, there's no remainder — the whole bar is just the
 * colored SSA segment.
 */
export default function OverlappingTargetBarChart({
  months,
  backgroundKey,
  backgroundLabel,
  target,
  pyaBarLabel = 'SSA PYA',
  valueFormatter = (v) => Math.round(v).toString(),
  height = 300,
}) {
  if (!months || months.length === 0) return null

  const data = [
    { label: pyaBarLabel, front: target, remainder: 0, isPyaBar: true, passed: false },
    ...months.map((m) => {
      const front = m.front
      const bg = m.background
      const remainder = front != null && bg != null ? Math.max(0, bg - front) : null
      return {
        label: m.label,
        front,
        remainder,
        isPyaBar: false,
        passed: front != null && front >= target,
      }
    }),
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={0} barCategoryGap="22%" margin={{ top: 24, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={44} />
        <Tooltip
          formatter={(v, name, props) => {
            if (name === 'Category 2 (remainder)') return [valueFormatter((props.payload.front || 0) + v), backgroundLabel]
            return [valueFormatter(v), name]
          }}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Legend
          payload={[
            { value: backgroundLabel, type: 'square', color: CATEGORY2_COLOR },
            { value: pyaBarLabel, type: 'square', color: PYA_COLOR },
            { value: 'Target Passed', type: 'square', color: TARGET_PASSED_COLOR },
            { value: 'Target Missed', type: 'square', color: TARGET_MISSED_COLOR },
          ]}
          wrapperStyle={{ fontSize: 11 }}
        />
        <ReferenceLine
          y={target}
          stroke="var(--ink-faint)"
          strokeDasharray="4 4"
          strokeWidth={1.25}
          label={{ value: `Target: ${valueFormatter(target)}`, position: 'insideTopLeft', fontSize: 11, fill: 'var(--ink-muted)' }}
        />
        {/* Bottom segment — SSA's real value, colored by target status
            (or blue for the leading PYA bar). Drawn first in the stack. */}
        <Bar dataKey="front" name="Actual" stackId="ssaStack" barSize={34} radius={[0, 0, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isPyaBar ? PYA_COLOR : entry.passed ? TARGET_PASSED_COLOR : TARGET_MISSED_COLOR} />
          ))}
          <LabelList dataKey="front" content={(props) => renderBarLabel(props, data[props.index], valueFormatter, pyaBarLabel)} />
        </Bar>
        {/* Top segment — the rest of Category 2's height above SSA,
            stacked directly on top so the combined bar reaches Category
            2's real total. */}
        <Bar dataKey="remainder" name="Category 2 (remainder)" stackId="ssaStack" fill={CATEGORY2_COLOR} barSize={34} radius={[3, 3, 0, 0]} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// The leading PYA bar gets a two-line label (value, then its name)
// matching the reference design — every other bar just gets its single
// formatted value.
function renderBarLabel(props, row, valueFormatter, pyaBarLabel) {
  const { x, y, width } = props
  if (row.front == null) return null
  const cx = x + width / 2
  if (row.isPyaBar) {
    return (
      <text x={cx} y={y + 26} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
        <tspan x={cx} dy="0">
          {valueFormatter(row.front)}
        </tspan>
        <tspan x={cx} dy="16">
          {pyaBarLabel}
        </tspan>
      </text>
    )
  }
  return (
    <text x={cx} y={y + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="#fff">
      {valueFormatter(row.front)}
    </text>
  )
}
