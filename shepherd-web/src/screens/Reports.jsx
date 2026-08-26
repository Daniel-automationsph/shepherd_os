import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { totalMembers } from '../data/mockData'

const TABS = ['Weekly', 'Monthly', 'Quarterly', 'Annual']

const REPORTS = {
  Weekly: {
    period: 'Week of Aug 18–24, 2026',
    sections: [
      ['KPI Performance', ['First Timers 107% on target', 'Life Groups 95% of headcount target', 'Attendance 94.4% of weekly target']],
      ['Life Group Performance', ['24 groups active', '18 healthy, 4 attention, 2 critical']],
      ['Attendance', ['425 average vs 450 target']],
      ['First Timers', ['64 recorded, +12% vs previous month']],
      ['Financial Status', ['₱482,500 of ₱500,000 — 96.5%']],
      ['Geographic Reach', ['22 of 37 barangays reached — 59% coverage']],
      ['Areas Needing Attention', ['Building Fund at 72%', '15 barangays unreached']],
    ],
  },
  Monthly: {
    period: 'August 2026',
    sections: [
      ['Current Performance', ['Overall KPI achievement trending upward across 4 of 5 pillars']],
      ['Previous Month Comparison', ['Attendance +8.2% vs July', 'First Timers +12% vs July']],
      ['Target vs Actual', ['Life Groups 286/300', 'Financial ₱482,500/₱500,000']],
      ['Growth', ['Membership growth +3.8%']],
      ['Variance', ['Financial variance -₱17,500']],
      ['Top-Performing Areas', ['Missions 115% of target', 'First Timers 107% of target']],
      ['Underperforming Areas', ['Building Fund 72%', 'Geographic Coverage 59%']],
    ],
  },
  Quarterly: {
    period: 'Q3 2026',
    sections: [
      ['Quarterly KPI Achievement', ['Church-wide average achievement: 93.4%']],
      ['Growth Trends', ['First Timers up every month since May']],
      ['Ministry Performance', ['Ministry scorecards pending future release']],
      ['Financial Performance', ['3 of 4 months at or above 90% achievement']],
      ['Geographic Expansion', ['Coverage moved from 43% to 59% over the quarter']],
      ['Life Group Growth', ['Headcount up from 241 to 286 (+18.7%)']],
    ],
  },
  Annual: {
    period: 'Year to Date 2026',
    sections: [
      ['Annual Targets', ['Set across all 5 core pillars']],
      ['Annual Achievement', ['Tracking at 93% average across active KPIs']],
      ['Year-over-Year Growth', ['Comparison unlocks once prior-year data is loaded']],
      ['Geographic Expansion', ['22 barangays reached to date']],
      ['Membership Growth', ['+3.8% growth this period']],
      ['Attendance Growth', ['+8.2% vs prior period']],
      ['Financial Performance', ['96.5% of annualized target pace']],
    ],
  },
}

export default function Reports() {
  const [tab, setTab] = useState('Weekly')
  const report = REPORTS[tab]

  return (
    <div>
      <div className="scroll-page" style={{ paddingBottom: 0 }}>
        <SectionHeader title="Reports" subtitle="Generated automatically from roll-up KPI data" />
      </div>
      <div style={{ padding: '0 24px', display: 'flex', gap: 4, borderBottom: '1px solid var(--line)' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 18px',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t ? 'var(--primary)' : 'var(--ink-faint)',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="scroll-page" style={{ maxWidth: 900, paddingTop: 20 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
            <div style={{ fontSize: 15, fontWeight: 700 }}>{report.period}</div>
            <div className="body-muted">Auto-generated from KPI roll-up data</div>
          </div>
          <button
            onClick={() => alert('Export coming soon (demo build).')}
            style={{
              padding: '9px 14px',
              borderRadius: 8,
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↓ Export
          </button>
        </div>

        <div style={{ height: 16 }} />

        {report.sections.map(([title, lines]) => (
          <div key={title} style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
            <div className="card" style={{ padding: '4px 16px' }}>
              {lines.map((line) => (
                <div key={line} style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
                  <span style={{ color: 'var(--primary)', fontSize: 8, marginTop: 6 }}>●</span>
                  <span style={{ fontSize: 14, flex: 1 }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="caption">Data reflects {totalMembers} total members as of latest sync.</div>
      </div>
    </div>
  )
}
