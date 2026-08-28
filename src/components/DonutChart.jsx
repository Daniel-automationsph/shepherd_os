import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

/**
 * Donut chart — reserved for genuine part-to-whole relationships (e.g.
 * Active vs Inactive members). Not for ranking many categories against
 * each other — a bar chart reads better once there are more than 2-3
 * segments, since angle differences are harder to compare at a glance
 * than bar length.
 */
export default function DonutChart({ segments, centerLabel, centerValue, height = 200 }) {
  if (!segments || segments.length === 0) return null
  const total = segments.reduce((s, seg) => s + seg.value, 0)

  return (
    <div style={{ position: 'relative' }}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={segments}
            dataKey="value"
            nameKey="label"
            innerRadius="62%"
            outerRadius="90%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {segments.map((seg, i) => (
              <Cell key={i} fill={seg.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v} (${((v / total) * 100).toFixed(0)}%)`, name]}
            contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          {centerValue && <div style={{ fontSize: 20, fontWeight: 800 }}>{centerValue}</div>}
          {centerLabel && <div className="caption">{centerLabel}</div>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, display: 'inline-block' }} />
            <span className="caption">
              {seg.label} — {((seg.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
