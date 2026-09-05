import { LineChart, Line, ReferenceLine, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * The real monthly series as a clean line chart — no PYA/Target bars
 * mixed into the same x-axis. Putting a single-point PYA/Target bar
 * alongside 12 months of line data used to flatten the line's own
 * shape, making month-to-month differences hard to read; PYA/Target/AA
 * now live in the separate, smaller PyaTargetActualBars component
 * instead, so this chart can focus purely on the monthly trend.
 *
 * `cumulative`: when true, the main line plots a running total (each
 * month adds to the one before it) instead of each month's own value —
 * makes sense for money/flow metrics like giving, not for headcounts.
 *
 * `showMonthly`: when true (only meaningful alongside `cumulative`),
 * overlays a SECOND line showing each month's own individual value, so
 * you can read both the running total's trajectory and the real
 * month-to-month differences in one chart. Since a running total (~1.7M
 * by the end of the year) and a single month's value (~100-180K) are on
 * completely different scales, the monthly line gets its own right-hand
 * Y-axis — sharing one axis would flatten it down to barely visible.
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
  showMonthly = false,
  color = 'var(--primary)',
  monthlyColor = 'var(--accent)',
  valueFormatter = (v) => Math.round(v).toString(),
  height = 240,
}) {
  if (!months || months.length === 0) return null

  let runningTotal = 0
  const data = months.map((m) => {
    if (m.unreported) return { label: m.label, trendLine: null, monthlyLine: null }
    runningTotal += cumulative ? m.value : 0
    return {
      label: m.label,
      trendLine: cumulative ? runningTotal : m.value,
      monthlyLine: cumulative && showMonthly ? m.value : null,
    }
  })

  const targetColor = '#ffbb38'
  const showDualAxis = cumulative && showMonthly

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 24, right: showDualAxis ? 16 : 16, bottom: 0, left: -10 }}>
        <CartesianGrid stroke="var(--line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
        <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={64} />
        {showDualAxis && (
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: monthlyColor }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} width={64} />
        )}
        <Tooltip
          formatter={(v, name) => [v == null ? 'Not yet reported' : valueFormatter(v), name]}
          contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
        />
        {showDualAxis && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {target != null && (
          <ReferenceLine
            yAxisId="left"
            y={target}
            stroke={targetColor}
            strokeOpacity={0.5}
            strokeDasharray="4 4"
            strokeWidth={1.25}
            label={{ value: `Target: ${valueFormatter(target)}`, position: 'insideTopRight', fontSize: 11, fill: 'var(--ink-muted)' }}
          />
        )}
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="trendLine"
          name={cumulative ? 'Cumulative' : 'Actual'}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          isAnimationActive={false}
          connectNulls={false}
        />
        {showDualAxis && (
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="monthlyLine"
            name="Month-to-Month"
            stroke={monthlyColor}
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: monthlyColor }}
            isAnimationActive={false}
            connectNulls={false}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
