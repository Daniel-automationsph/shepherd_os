import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { useAppData } from '../context/DataContext'

const TABS = ['Weekly', 'Monthly', 'Quarterly', 'Annual']

// Narrative text below is grounded in the JIL Pinamalayan POR (Sep 2025–
// Aug 2026): target = PYA, actual = AA, per church leadership's direction.
const REPORTS = {
  Weekly: {
    period: 'Week of Jul 27 – Aug 2, 2026',
    sections: [
      ['KPI Performance', ['Attendance 84% of target', 'First Timers 87% of target', 'Life Groups 94% of headcount target']],
      ['Life Group Performance', ['74 groups across 4 Extension Church areas', 'Sta. Rita carries 57 of the 74 groups']],
      ['Attendance', ['249 average vs 297 target (PYA)']],
      ['First Timers', ['July: 43 recorded, up from 33 in June']],
      ['Financial Status', ['₱1,704,171 of ₱1,909,014 (PYA) — 89%']],
      ['Geographic Reach', ['23 of 37 barangays reached, incl. 4 Extension Churches']],
      ['Areas Needing Attention', ['Hetero life group membership down 70%', '0 of 15 evangelized reached Encounter stage']],
    ],
  },
  Monthly: {
    period: 'July 2026',
    sections: [
      ['Current Performance', ['Attendance and Tithes both trailing PYA; Volunteer workers ahead']],
      ['Previous Month Comparison', ['First Timers +10% vs June', 'Attendance −2% vs June']],
      ['Target vs Actual', ['Life Groups 756/802 membership', 'Financial ₱1,704,171/₱1,909,014']],
      ['Growth', ['Total membership growth +0.3% YoY']],
      ['Variance', ['Financial variance −₱204,843 vs PYA']],
      ['Top-Performing Areas', ['Volunteer workers +8% YoY', 'Buli life group membership +1.7%']],
      ['Underperforming Areas', ['Hetero LG membership −70%', 'Evangelism follow-through −44%']],
    ],
  },
  Quarterly: {
    period: 'May – Jul 2026',
    sections: [
      ['Quarterly KPI Achievement', ['Attendance and Financial both tracking below PYA pace']],
      ['Growth Trends', ['First Timers recovering since April (36 → 33 → 39 → 43)']],
      ['Ministry Performance', ['4 Extension Church areas: Sta. Rita, Lumambayan, Buli, Inclanay']],
      ['Financial Performance', ['Tithes & Offering averaging ~₱155K/month over the quarter']],
      ['Geographic Expansion', ['Coverage moved from 54% to 62% over the quarter']],
      ['Life Group Growth', ['Buli grew from 60 to 61; other 3 areas held steady']],
    ],
  },
  Annual: {
    period: 'Sep 2025 – Aug 2026 (POR Period)',
    sections: [
      ['Annual Targets', ['Set as PYA (Previous Year Average) across all tracked metrics']],
      ['Annual Achievement', ['Membership 100.3% · Financial 89.3% · Attendance 83.8% of PYA']],
      ['Year-over-Year Growth', ['Total membership 917 → 920 (+0.3%)']],
      ['Geographic Expansion', ['23 barangays reached to date, incl. 4 Extension Church areas']],
      ['Membership Growth', ['+0.3% YoY (Category 1); Category 2 down 3.5%']],
      ['Attendance Growth', ['−16.2% YoY — the year\u2019s most significant decline']],
      ['Financial Performance', ['89.3% of PYA pace, with August not yet reported']],
    ],
  },
}

export default function Reports() {
  const { data } = useAppData()
  const [tab, setTab] = useState('Weekly')
  const report = REPORTS[tab]

  return (
    <div>
      <div className="scroll-page" style={{ paddingBottom: 0 }}>
        <SectionHeader title="Reports" subtitle="Generated automatically from roll-up KPI data" />
      </div>
      <div className="desktop-only">
        <div style={{ padding: '0 24px', display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
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
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Phone view: four tabs crammed into a narrow screen either wrap
          awkwardly or need horizontal scrolling to discover — a dropdown
          makes every option visible at a glance without either problem. */}
      <div className="mobile-only" style={{ padding: '0 24px 12px' }}>
        <select
          value={tab}
          onChange={(e) => setTab(e.target.value)}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 10,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--primary)',
          }}
        >
          {TABS.map((t) => (
            <option key={t} value={t}>
              {t} Report
            </option>
          ))}
        </select>
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

        <div className="caption">Data reflects {data.totalMembers} total members as of latest sync.</div>
      </div>
    </div>
  )
}
