import { BarChart, Bar, Cell, LabelList, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY2_COLOR = '#c9cdd3'
const PYA_COLOR = '#2f7ed8'
const TARGET_PASSED_COLOR = '#1fa864'
const TARGET_MISSED_COLOR = '#e14b3f'

/**
 * Overlapping bar chart: Category 2 renders as a wide gray background
 * bar, with the front metric (e.g. Sunday Service Attendance) drawn as a
 * narrower bar on top of it, colored green ("Target Passed") or red
 * ("Target Missed") depending on whether that month's value met the
 * target. A dashed horizontal line marks the flat target value across
 * the whole chart, and a standalone blue bar at the very start shows
 * that same target value labeled as "SSA PYA" — both represent the same
 * number, just shown two ways (as a real bar, and as a reference line
 * for scanning across the rest of the chart).
 *
 * Both the background and front bars share the same category (month)
 * and baseline (0) — this is a true visual overlap, not a stacked or
 * grouped/side-by-side chart.
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
    { label: pyaBarLabel, background: null, front: target, isPyaBar: true, passed: false },
    ...months.map((m) => ({
      label: m.label,
      background: m.background,
      front: m.front,
      isPyaBar: false,
      passed: m.front != null && m.front >= target,
    })),
  ]

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barGap={0} barCategoryGap="22%" margin={{ top: 24, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={44} />
        <Tooltip
          formatter={(v, name) => [v == null ? 'Not yet reported' : valueFormatter(v), name]}
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
        {/* Background bar (drawn first = behind) — wide, gray. Absent
            (null) for the leading PYA bar, matching the reference image
            where that bar stands alone with no gray behind it. */}
        <Bar dataKey="background" name={backgroundLabel} fill={CATEGORY2_COLOR} barSize={34} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        {/* Front bar (drawn second = on top) — narrower, colored blue for
            the PYA bar, green/red for real months by target status. */}
        <Bar dataKey="front" name="Actual" barSize={34} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.isPyaBar ? PYA_COLOR : entry.passed ? TARGET_PASSED_COLOR : TARGET_MISSED_COLOR} />
          ))}
          <LabelList
            dataKey="front"
            content={(props) => renderBarLabel(props, data[props.index], valueFormatter, pyaBarLabel)}
          />
        </Bar>
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
