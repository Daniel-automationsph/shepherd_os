import { ComposedChart, Bar, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * PYA (and optionally a separate Target) shown as standalone bars first,
 * the real monthly series shown as a connected line after them — a
 * deliberate mix of chart types in one chart: PYA/Target are single
 * reference numbers (bars fit), the monthly trend is a progression over
 * time (a line fits better than more bars).
 *
 * `cumulative`: when true, the line plots a running total (each month
 * adds to the one before it) instead of each month's own value — makes
 * sense for money/flow metrics like giving, not for headcounts.
 *
 * Built as one ComposedChart with Bar series that only have values at
 * their own reference category (null everywhere else) and a Line series
 * that only has values at the month categories — Recharts renders each
 * series only where its own dataKey has a real value, so they naturally
 * sit side by side without extra positioning logic. A dashed
 * ReferenceLine at the target value (when provided) lets you read the
 * running total against it at a glance across every month, not just at
 * the Target bar itself.
 */
export default function PyaBarThenLineChart({
  pya,
  target,
  months,
  cumulative = false,
  color = 'var(--primary)',
  valueFormatter = (v) => Math.round(v).toString(),
  height = 240,
}) {
  if (!months || months.length === 0) return null

  let runningTotal = 0
  const monthRows = months.map((m) => {
    if (m.unreported) return { label: m.label, pyaBar: null, targetBar: null, trendLine: null }
    runningTotal += cumulative ? m.value : 0
    return { label: m.label, pyaBar: null, targetBar: null, trendLine: cumulative ? runningTotal : m.value }
  })

  const data = [
    { label: 'PYA', pyaBar: pya, targetBar: null, trendLine: null },
    ...(target != null ? [{ label: 'Target', pyaBar: null, targetBar: target, trendLine: null }] : []),
    ...monthRows,
  ]

  const pyaColor = '#8095a8' // muted — a reference baseline, distinct from the trend's own color
  const targetColor = '#c98a2c'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={64} />
        <Tooltip
          formatter={(v, name) => [v == null ? 'Not yet reported' : valueFormatter(v), name]}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {target != null && (
          <ReferenceLine
            y={target}
            stroke={targetColor}
            strokeOpacity={0.5}
            strokeDasharray="4 4"
            strokeWidth={1.25}
            label={{ value: `Target: ${valueFormatter(target)}`, position: 'insideTopRight', fontSize: 11, fill: 'var(--ink-muted)' }}
          />
        )}
        <Bar dataKey="pyaBar" name="PYA" fill={pyaColor} radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false} />
        {target != null && <Bar dataKey="targetBar" name="Target" fill={targetColor} radius={[4, 4, 0, 0]} barSize={34} isAnimationActive={false} />}
        <Line
          type="monotone"
          dataKey="trendLine"
          name={cumulative ? 'Cumulative' : 'Actual'}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          isAnimationActive={false}
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
