import { BarChart, Bar, Cell, LabelList, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY2_COLOR = '#c9cdd3'
const TARGET_PASSED_COLOR = '#1fa864'
const TARGET_MISSED_COLOR = '#e14b3f'

/**
 * Overlapping bar chart: Category 2 renders as a wide gray background
 * bar, with the front metric (e.g. Sunday Service Attendance) drawn as a
 * narrower bar on top of it, colored green ("Target Passed") or red
 * ("Target Missed") depending on whether that month's value met the
 * target. A dashed horizontal line marks the flat target value across
 * the whole chart.
 *
 * Both bars share the same category (month) and baseline (0) — this is
 * a true visual overlap, not a stacked or grouped/side-by-side chart.
 */
export default function OverlappingTargetBarChart({
  months,
  backgroundKey,
  backgroundLabel,
  target,
  valueFormatter = (v) => Math.round(v).toString(),
  height = 300,
}) {
  if (!months || months.length === 0) return null

  const data = months.map((m) => ({
    label: m.label,
    background: m.background,
    front: m.front,
    passed: m.front != null && m.front >= target,
  }))

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
        {/* Background bar (drawn first = behind) — wide, gray */}
        <Bar dataKey="background" name={backgroundLabel} fill={CATEGORY2_COLOR} barSize={34} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        {/* Front bar (drawn second = on top) — narrower, colored by target status */}
        <Bar dataKey="front" name="Actual" barSize={16} radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.passed ? TARGET_PASSED_COLOR : TARGET_MISSED_COLOR} />
          ))}
          <LabelList dataKey="front" position="inside" formatter={(v) => (v == null ? '' : valueFormatter(v))} style={{ fontSize: 11, fontWeight: 700, fill: '#fff' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
