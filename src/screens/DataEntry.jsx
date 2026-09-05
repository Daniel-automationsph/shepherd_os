import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { sheetInputStyle } from '../components/FormSheet'
import { useAppData } from '../context/DataContext'
import { fetchWeeklyEntries, upsertWeeklyEntry, recomputeMonthlyActual, fetchRecentSubmissions } from '../data/api'

// Each field maps to one of the 3 underlying tables — Data Entry writes
// individual WEEKLY entries (the real source of truth), and the
// existing monthly Actual columns are kept in sync by summing them.
const FIELDS = [
  ['attendance', 'Sunday Service Attendance', 'people'],
  ['firstTimers', 'First Timers', 'people'],
  ['tithes', 'Tithes', 'financial'],
  ['offerings', 'Offering', 'financial'],
  ['pledges', 'Pledges', 'financial'],
  ['missionOffering', 'Mission', 'financial'],
  ['support', 'Support', 'financial'],
  ['numberOfTithers', 'Number of Tithers', 'people'],
  ['lgAttendance', 'Life Group Attendance', 'lifeGroup'],
  ['lgFirstTimers', 'Life Group First Timer', 'lifeGroup'],
]
const FIELD_LABELS = Object.fromEntries(FIELDS.map(([key, label]) => [key, label]))

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function monthLabel(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function DataEntry() {
  const { data } = useAppData()
  const { areaPeopleStats } = data
  const churches = (areaPeopleStats || []).map((p) => ({ areaName: p.areaName, isMainChurch: p.isMainChurch }))

  return (
    <div className="scroll-page">
      <SectionHeader
        title="Data Entry"
        subtitle="Enter each week's real numbers as they happen — the monthly total is the sum of everything entered this month."
      />
      <RecentSubmissions />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
        {churches.map((church) => (
          <ChurchCard key={church.areaName} church={church} />
        ))}
      </div>
    </div>
  )
}

function RecentSubmissions() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchRecentSubmissions(15)
      .then(setRows)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return null // quietly skip the log rather than blocking the whole page over it
  if (!rows) return <div className="body-muted">Loading recent activity...</div>

  return (
    <div className="card">
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Recent Submissions</h2>
      <div className="caption" style={{ marginBottom: 12 }}>
        Every entry across every church — visible to everyone, not just Admins.
      </div>
      {rows.length === 0 ? (
        <div className="body-muted">No submissions yet.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640, fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: 'var(--surface-muted)' }}>
                {['Church', 'Field', 'Week Of', 'Value', 'Submitted By', 'When'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: 'var(--ink-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td style={{ padding: '6px 10px' }}>{r.area_name}</td>
                  <td style={{ padding: '6px 10px' }}>{FIELD_LABELS[r.field_key] || r.field_key}</td>
                  <td style={{ padding: '6px 10px' }}>{r.week_start}</td>
                  <td style={{ padding: '6px 10px', fontWeight: 700 }}>{r.value}</td>
                  <td style={{ padding: '6px 10px' }}>{r.submitted_by_name || 'Unknown'}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--ink-faint)' }}>{new Date(r.updated_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ChurchCard({ church }) {
  const { areaName, isMainChurch } = church
  const [weekDate, setWeekDate] = useState(todayStr())
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map(([key]) => [key, ''])))
  const [entries, setEntries] = useState([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  async function loadEntries() {
    setLoadingEntries(true)
    try {
      const data = await fetchWeeklyEntries(areaName, weekDate)
      setEntries(data)
      // If an entry already exists for the selected week, pre-fill the
      // form with it so re-opening a week you already entered shows
      // what's there (and edits update it, rather than double-counting).
      const forThisWeek = Object.fromEntries(FIELDS.map(([key]) => [key, '']))
      for (const e of data) {
        if (e.week_start === weekDate && forThisWeek[e.field_key] !== undefined) {
          forThisWeek[e.field_key] = e.value
        }
      }
      setForm(forThisWeek)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingEntries(false)
    }
  }

  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekDate])

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const changedFields = FIELDS.filter(([key]) => form[key] !== '').map(([key]) => key)
      for (const key of changedFields) {
        await upsertWeeklyEntry(areaName, key, weekDate, form[key])
      }
      for (const key of changedFields) {
        await recomputeMonthlyActual(areaName, key, weekDate)
      }
      await loadEntries()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Group this month's entries by week, then by field, for the progress table.
  const weeks = [...new Set(entries.map((e) => e.week_start))].sort()
  const totals = Object.fromEntries(FIELDS.map(([key]) => [key, entries.filter((e) => e.field_key === key).reduce((s, e) => s + Number(e.value), 0)]))

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>{areaName}</h2>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 999,
            color: isMainChurch ? '#00698c' : '#256e42',
            background: isMainChurch ? '#e0f7ff' : '#e8f8ee',
          }}
        >
          {isMainChurch ? 'MAIN CHURCH' : 'EXTENSION CHURCH'}
        </span>
      </div>

      <div className="two-col" style={{ marginTop: 14 }}>
        {/* --- Weekly entry form --- */}
        <div>
          <div className="label" style={{ marginBottom: 6 }}>
            Week Of
          </div>
          <input type="date" value={weekDate} onChange={(e) => setWeekDate(e.target.value)} style={{ ...sheetInputStyle, marginBottom: 12 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FIELDS.map(([key, label, kind]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13 }}>{label}</div>
                <input
                  type="number"
                  step={kind === 'financial' ? 'any' : 1}
                  value={form[key]}
                  onChange={set(key)}
                  style={{ ...sheetInputStyle, width: 110 }}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {error && <div style={{ color: 'var(--status-critical)', fontSize: 13, marginTop: 10 }}>{error}</div>}

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              marginTop: 16,
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: savedFlash ? 'var(--status-on-target)' : 'var(--primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: 13.5,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving...' : savedFlash ? 'Saved ✓' : `Save Week of ${weekDate}`}
          </button>
        </div>

        {/* --- Monthly progress --- */}
        <div>
          <div className="label" style={{ marginBottom: 6 }}>
            {monthLabel(weekDate)} — Weekly Progress
          </div>
          {loadingEntries ? (
            <div className="body-muted">Loading...</div>
          ) : weeks.length === 0 ? (
            <div className="body-muted">No weeks entered yet this month.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-muted)' }}>Field</th>
                    {weeks.map((w) => (
                      <th key={w} style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-muted)' }}>
                        {new Date(w + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </th>
                    ))}
                    <th style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {FIELDS.map(([key, label]) => (
                    <tr key={key} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '6px 8px' }}>{label}</td>
                      {weeks.map((w) => {
                        const entry = entries.find((e) => e.field_key === key && e.week_start === w)
                        const title = entry
                          ? `${entry.submitted_by_name || 'Unknown'} — ${new Date(entry.updated_at).toLocaleString()}`
                          : undefined
                        return (
                          <td key={w} title={title} style={{ padding: '6px 8px', textAlign: 'right', cursor: entry ? 'help' : 'default' }}>
                            {entry ? entry.value : '—'}
                          </td>
                        )
                      })}
                      <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700 }}>{totals[key]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
