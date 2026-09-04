import { LineChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * The real monthly series as a clean line chart — no PYA/Target bars
 * mixed into the same x-axis. Putting a single-point PYA/Target bar
 * alongside 12 months of line data used to flatten the line's own
 * shape, making month-to-month differences hard to read; PYA/Target/AA
 * now live in the separate, smaller PyaTargetActualBars component
 * instead, so this chart can focus purely on the monthly trend.
 *
 * `cumulative`: when true, the line plots a running total (each month
 * adds to the one before it) instead of each month's own value — makes
 * sense for money/flow metrics like giving, not for headcounts.
 *
 * A dashed ReferenceLine at the target value (when provided) is kept —
 * unlike a bar, it doesn't take up its own x-axis slot or distort the
 * line's scale, so it stays as a lightweight way to compare the trend
 * against target at every month, not just the endpoint.
 */
export default function PyaBarThenLineChart({
  target,
  months,
  cumulative = false,
  color = 'var(--primary)',
  valueFormatter = (v) => Math.round(v).toString(),
  height = 240,
}) {
  if (!months || months.length === 0) return null

  let runningTotal = 0
  const data = months.map((m) => {
    if (m.unreported) return { label: m.label, trendLine: null }
    runningTotal += cumulative ? m.value : 0
    return { label: m.label, trendLine: cumulative ? runningTotal : m.value }
  })

  const targetColor = '#c98a2c'

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 24, right: 16, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={64} />
        <Tooltip
          formatter={(v) => [v == null ? 'Not yet reported' : valueFormatter(v), cumulative ? 'Cumulative' : 'Actual']}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
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
      </LineChart>
    </ResponsiveContainer>
  )
}
