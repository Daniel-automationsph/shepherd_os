import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

/**
 * Standardized "Parent → Subset → Rate" pattern for anywhere one metric
 * is a subset of another (e.g. Category 2 members are a subset of
 * Category 1). Renders:
 *   1. Three KPI cards — Parent actual, Subset actual, and the derived
 *      Rate (subset ÷ parent) — each compared against ITS OWN PYA
 *      benchmark, since PYA is a benchmark per category, not a category
 *      of its own.
 *   2. One combined trend chart: parent & subset current values as thick
 *      solid lines, their PYA benchmarks as thin dashed lines in the same
 *      hue at low opacity — so PYA reads as reference context, not a
 *      competing trend.
 *
 * The gap between parent and subset is framed as "Rate" / "Not in
 * [subset]" — not automatically negative, since a subset naturally being
 * smaller than its parent is expected, not a problem by itself. Only the
 * PYA comparison (color-coded) says whether that's improving or not.
 */
export default function ParentSubsetPanel({
  parentLabel,
  parentActual,
  parentPya,
  parentMonths,
  subsetLabel,
  subsetActual,
  subsetPya,
  subsetMonths,
  rateLabel = 'Rate',
  formatter = (v) => Math.round(v).toString(),
  parentColor = '#2f5233',
  subsetColor = '#c98a2c',
}) {
  const parentGrowthPct = parentPya > 0 ? ((parentActual - parentPya) / parentPya) * 100 : null
  const subsetGrowthPct = subsetPya > 0 ? ((subsetActual - subsetPya) / subsetPya) * 100 : null

  const rateActual = parentActual > 0 ? (subsetActual / parentActual) * 100 : 0
  const ratePya = parentPya > 0 ? (subsetPya / parentPya) * 100 : 0
  const ratePpChange = rateActual - ratePya // percentage points, not percent-of-percent

  const cards = [
    { label: parentLabel, value: formatter(parentActual), growth: parentGrowthPct, growthUnit: '%' },
    { label: subsetLabel, value: formatter(subsetActual), growth: subsetGrowthPct, growthUnit: '%' },
    { label: rateLabel, value: `${rateActual.toFixed(1)}%`, growth: ratePpChange, growthUnit: 'pp' },
  ]

  // Build combined chart data — PYA is rendered as a flat dashed line
  // (same value repeated across every month) since it's a single
  // benchmark number, not its own monthly series.
  const chartData = (parentMonths || []).map((m, i) => ({
    label: m.label,
    parentCurrent: m.value,
    subsetCurrent: subsetMonths?.[i]?.value ?? null,
    parentPyaLine: parentPya,
    subsetPyaLine: subsetPya,
  }))

  return (
    <div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 18 }}>
        {cards.map((c) => (
          <div className="card" key={c.label} style={{ minWidth: 0 }}>
            <div className="label" style={{ overflowWrap: 'break-word' }}>
              {c.label}
            </div>
            <div
              style={{
                fontSize: 'clamp(18px, 5vw, 24px)',
                fontWeight: 800,
                marginTop: 6,
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
              }}
            >
              {c.value}
            </div>
            {c.growth != null && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  marginTop: 4,
                  overflowWrap: 'break-word',
                  color: c.growth >= 0 ? 'var(--status-on-target)' : 'var(--status-critical)',
                }}
              >
                {c.growth >= 0 ? '+' : ''}
                {c.growth.toFixed(1)}
                {c.growthUnit} vs PYA
              </div>
            )}
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 6, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="parentFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={parentColor} stopOpacity={0.45} />
                <stop offset="95%" stopColor={parentColor} stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="subsetFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={subsetColor} stopOpacity={0.55} />
                <stop offset="95%" stopColor={subsetColor} stopOpacity={0.08} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10.5, fill: 'var(--ink-faint)' }} axisLine={{ stroke: 'var(--line)' }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--ink-faint)' }} axisLine={false} tickLine={false} tickFormatter={formatter} width={44} />
            <Tooltip
              formatter={(v, name) => [formatter(v), name]}
              contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {/* Current values: smooth filled areas — the main visual story */}
            <Area
              type="natural"
              dataKey="parentCurrent"
              name={parentLabel}
              stroke={parentColor}
              strokeWidth={2.5}
              fill="url(#parentFill)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="natural"
              dataKey="subsetCurrent"
              name={subsetLabel}
              stroke={subsetColor}
              strokeWidth={2.5}
              fill="url(#subsetFill)"
              dot={false}
              isAnimationActive={false}
            />
            {/* PYA benchmarks: thin dashed lines, no fill — reference
                context sitting on top of the areas, not competing with them */}
            <Line
              type="natural"
              dataKey="parentPyaLine"
              name={`${parentLabel} PYA`}
              stroke={parentColor}
              strokeOpacity={0.5}
              strokeWidth={1.25}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="natural"
              dataKey="subsetPyaLine"
              name={`${subsetLabel} PYA`}
              stroke={subsetColor}
              strokeOpacity={0.5}
              strokeWidth={1.25}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      <div className="caption" style={{ marginTop: 8 }}>
        {rateLabel}: {rateActual.toFixed(1)}% · Not in {subsetLabel}: {(100 - rateActual).toFixed(1)}%
      </div>
    </div>
  )
}
