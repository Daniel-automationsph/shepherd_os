import SectionHeader from '../components/SectionHeader'
import { usePeriod } from '../context/PeriodContext'
import { peso, commas } from '../data/api'
import { UNREPORTED_MONTHS } from '../data/periods'

export default function Reports() {
  const { selected, metrics, loading, error, refetch } = usePeriod()

  return (
    <div className="scroll-page" style={{ maxWidth: 900 }}>
      <SectionHeader
        title="Reports"
        subtitle="Real figures for the period selected in the sidebar — not a fixed weekly/monthly template."
      />

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--accent-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          ▤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{selected?.label}</div>
          <div className="body-muted">Church-wide totals for this period, from the original POR data.</div>
        </div>
      </div>

      {loading ? (
        <div className="body-muted" style={{ textAlign: 'center', padding: 40 }}>
          Loading real figures for this period...
        </div>
      ) : error ? (
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Couldn't load this period</div>
          <div className="body-muted" style={{ marginBottom: 14 }}>
            {error}
          </div>
          <button
            onClick={refetch}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        metrics && (
          <>
            <ReportSection title="Attendance & Membership">
              <MetricRow label="Average Weekly Attendance" actual={metrics.attendance.actual.toFixed(0)} target={metrics.attendance.target.toFixed(0)} />
              <MetricRow label="First Timers" actual={commas(metrics.firstTimers.actual)} target={commas(metrics.firstTimers.target)} />
              <MetricRow label="Total Membership (as of period)" actual={commas(metrics.membership.actual)} target={null} />
            </ReportSection>

            <ReportSection title="Financial">
              <MetricRow label="Tithes" actual={peso(metrics.tithes.actual)} target={peso(metrics.tithes.target)} />
              <MetricRow label="Offerings" actual={peso(metrics.offerings.actual)} target={peso(metrics.offerings.target)} />
              <MetricRow label="Mission Offering" actual={peso(metrics.missionOffering.actual)} target={peso(metrics.missionOffering.target)} />
              <MetricRow label="Pledges" actual={peso(metrics.pledges.actual)} target={peso(metrics.pledges.target)} />
              <MetricRow label="Total Giving" actual={peso(metrics.totalGiving.actual)} target={peso(metrics.totalGiving.target)} bold />
            </ReportSection>

            <ReportSection title="Life Groups">
              <MetricRow label="Life Group Membership (as of period)" actual={commas(metrics.lifeGroupMembership.actual)} target={null} />
            </ReportSection>

            {selected?.months.some((m) => UNREPORTED_MONTHS.has(m)) && (
              <div className="caption" style={{ marginTop: 4 }}>
                Note: this period includes a month not yet reported in the source data — figures reflect only the months that were.
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}

function ReportSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
      <div className="card" style={{ padding: '4px 16px' }}>
        {children}
      </div>
    </div>
  )
}

function MetricRow({ label, actual, target, bold }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ flex: 1, fontSize: 14, fontWeight: bold ? 700 : 400 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>
        {actual}
        {target != null && <span className="body-muted" style={{ fontWeight: 400 }}> {' '}/ {target} target</span>}
      </div>
    </div>
  )
}
