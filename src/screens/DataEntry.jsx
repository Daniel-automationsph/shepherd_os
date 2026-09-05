import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { sheetInputStyle } from '../components/FormSheet'
import { useAppData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
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
const ADMIN_ROLES = ['admin', 'pastor_mis']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10)
}

// Every Sunday in the given month — auto-computed and identical for
// every church, so "Week 1" always means the same real calendar date
// everywhere, instead of each Coordinator picking their own date and
// risking a mismatch between churches.
function sundaysInMonth(year, monthIndex) {
  const sundays = []
  const d = new Date(year, monthIndex, 1)
  while (d.getDay() !== 0) d.setDate(d.getDate() + 1)
  while (d.getMonth() === monthIndex) {
    sundays.push(toDateStr(d))
    d.setDate(d.getDate() + 7)
  }
  return sundays
}

// A week is still editable by a Coordinator through the day after it —
// matches the database's own deadline rule (lock_submitted_weeks.sql),
// so the UI shows the same lock state the database will actually
// enforce, rather than a UI that looks open but silently fails to save.
function isWithinDeadline(weekDateStr) {
  const deadline = new Date(weekDateStr + 'T00:00:00')
  deadline.setDate(deadline.getDate() + 1)
  deadline.setHours(23, 59, 59, 999)
  return new Date() <= deadline
}

function monthLabel(year, monthIndex) {
  return new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function DataEntry() {
  const { data } = useAppData()
  const { areaPeopleStats } = data
  const churches = (areaPeopleStats || []).map((p) => ({ areaName: p.areaName, isMainChurch: p.isMainChurch }))

  const today = new Date()
  const [year] = useState(today.getFullYear())
  const [monthIndex] = useState(today.getMonth())
  const weeks = sundaysInMonth(year, monthIndex)

  return (
    <div className="scroll-page">
      <SectionHeader
        title="Data Entry"
        subtitle="Enter each week's real numbers as they happen — the monthly total is the sum of everything entered this month."
      />
      <RecentSubmissions />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 20 }}>
        {churches.map((church) => (
          <ChurchCard key={church.areaName} church={church} weeks={weeks} year={year} monthIndex={monthIndex} />
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

function ChurchCard({ church, weeks, year, monthIndex }) {
  const { areaName, isMainChurch } = church
  const { role } = useAuth()
  const isAdmin = ADMIN_ROLES.includes(role)

  const [selectedWeek, setSelectedWeek] = useState(weeks.find((w) => isWithinDeadline(w)) || weeks[weeks.length - 1])
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map(([key]) => [key, ''])))
  const [entries, setEntries] = useState([])
  const [loadingEntries, setLoadingEntries] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const locked = !isAdmin && !isWithinDeadline(selectedWeek)

  async function loadEntries() {
    setLoadingEntries(true)
    try {
      const data = await fetchWeeklyEntries(areaName, `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`)
      setEntries(data)
      const forThisWeek = Object.fromEntries(FIELDS.map(([key]) => [key, '']))
      for (const e of data) {
        if (e.week_start === selectedWeek && forThisWeek[e.field_key] !== undefined) {
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
  }, [selectedWeek])

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const changedFields = FIELDS.filter(([key]) => form[key] !== '').map(([key]) => key)
      for (const key of changedFields) {
        await upsertWeeklyEntry(areaName, key, selectedWeek, form[key])
      }
      for (const key of changedFields) {
        await recomputeMonthlyActual(areaName, key, selectedWeek)
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

      {/* --- Week selector: every Sunday this month, auto-computed --- */}
      <div className="label" style={{ marginTop: 14, marginBottom: 6 }}>
        {monthLabel(year, monthIndex)}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {weeks.map((w, i) => {
          const weekLocked = !isAdmin && !isWithinDeadline(w)
          const isSelected = w === selectedWeek
          return (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--line)',
                background: isSelected ? 'rgba(47,82,51,0.08)' : 'var(--surface)',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {weekLocked && <span style={{ fontSize: 11 }}>🔒</span>}
              <span>
                Week {i + 1} — {new Date(w + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </button>
          )
        })}
      </div>

      <div className="two-col">
        {/* --- Weekly entry form --- */}
        <div>
          {locked ? (
            <div
              style={{
                background: 'var(--surface-muted)',
                border: '1px solid var(--line)',
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>🔒 This week is locked</div>
              <div className="body-muted" style={{ fontSize: 13 }}>
                The entry window for this week has closed. Contact an Admin if a correction is needed.
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: locked ? 0.5 : 1 }}>
            {FIELDS.map(([key, label, kind]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, fontSize: 13 }}>{label}</div>
                <input
                  type="number"
                  step={kind === 'financial' ? 'any' : 1}
                  value={form[key]}
                  onChange={set(key)}
                  disabled={locked}
                  style={{ ...sheetInputStyle, width: 110 }}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          {error && <div style={{ color: 'var(--status-critical)', fontSize: 13, marginTop: 10 }}>{error}</div>}

          {!locked && (
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
              {saving ? 'Saving...' : savedFlash ? 'Saved ✓' : `Save Week of ${selectedWeek}`}
            </button>
          )}
        </div>

        {/* --- Monthly progress --- */}
        <div>
          <div className="label" style={{ marginBottom: 6 }}>
            {monthLabel(year, monthIndex)} — Weekly Progress
          </div>
          {loadingEntries ? (
            <div className="body-muted">Loading...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480, fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--surface-muted)' }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-muted)' }}>Field</th>
                    {weeks.map((w, i) => (
                      <th key={w} style={{ textAlign: 'right', padding: '6px 8px', fontWeight: 700, color: 'var(--ink-muted)' }}>
                        {!isAdmin && !isWithinDeadline(w) && '🔒 '}
                        Wk {i + 1}
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
