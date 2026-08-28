import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import StatusBadge from '../components/StatusBadge'
import FormSheet, { Field, sheetInputStyle, SheetButton } from '../components/FormSheet'
import { useAppData } from '../context/DataContext'
import {
  KPI_STATUS,
  commas,
  updateOrgStats,
  createLifeGroup,
  updateLifeGroup,
  deleteLifeGroup,
  updateBarangay,
  createFinancialCategory,
  updateFinancialCategory,
  deleteFinancialCategory,
  createAttentionItem,
  updateAttentionItem,
  deleteAttentionItem,
  createKpiTarget,
  updateKpi,
  deleteKpi,
  updateAreaPeopleStats,
  updateAreaFinancialStats,
} from '../data/api'

const TABS = ['People', 'Area People', 'Life Groups', 'Financial', 'Area Financial', 'Barangays', 'Attention', 'KPIs']

export default function Admin() {
  const [tab, setTab] = useState('People')

  return (
    <div className="scroll-page">
      <SectionHeader title="Admin Console" subtitle="Update the numbers behind every screen — changes save directly to Supabase." />

      <div className="desktop-only">
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', overflowX: 'auto', marginBottom: 20 }}>
          {TABS.map((t) => (
            <TabButton key={t} label={t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>
      </div>
      <div className="mobile-only" style={{ marginBottom: 20 }}>
        <select value={tab} onChange={(e) => setTab(e.target.value)} style={{ ...sheetInputStyle, fontWeight: 700, color: 'var(--primary)' }}>
          {TABS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {tab === 'People' && <PeopleSection />}
      {tab === 'Area People' && <AreaPeopleSection />}
      {tab === 'Life Groups' && <LifeGroupsSection />}
      {tab === 'Financial' && <FinancialSection />}
      {tab === 'Area Financial' && <AreaFinancialSection />}
      {tab === 'Barangays' && <BarangaysSection />}
      {tab === 'Attention' && <AttentionSection />}
      {tab === 'KPIs' && <KpisSection />}
    </div>
  )
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 18px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        color: active ? 'var(--primary)' : 'var(--ink-faint)',
        fontWeight: 700,
        fontSize: 13.5,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  )
}

function AddButton({ onClick, label = '+ Add New' }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 10,
        padding: '10px 16px',
        fontWeight: 700,
        fontSize: 13.5,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function IconButton({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'var(--surface-muted)',
        border: 'none',
        borderRadius: 8,
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: 13,
      }}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------
// People & Growth — a single form since org_stats is one row.
// ---------------------------------------------------------------------
function PeopleSection() {
  const { data, refetch } = useAppData()
  const [form, setForm] = useState({
    totalMembers: data.totalMembers,
    activeMembers: data.activeMembers,
    newMembers: data.newMembers,
    inactiveMembers: data.inactiveMembers,
    membershipGrowthPct: data.membershipGrowthPct,
    totalLifeGroups: data.totalLifeGroups,
    targetLifeGroups: data.targetLifeGroups,
    totalBarangays: data.totalBarangays,
    barangaysReached: data.barangaysReached,
    reachTargetPct: data.reachTargetPct,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [savedFlash, setSavedFlash] = useState(false)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateOrgStats(form)
      await refetch()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    ['totalMembers', 'Total Members'],
    ['activeMembers', 'Active Members'],
    ['newMembers', 'New Members (this period)'],
    ['inactiveMembers', 'Inactive Members'],
    ['membershipGrowthPct', 'Membership Growth %'],
    ['totalLifeGroups', 'Total Life Groups (all, incl. small ones)'],
    ['targetLifeGroups', 'Target Life Groups'],
    ['totalBarangays', 'Total Barangays'],
    ['barangaysReached', 'Barangays Reached'],
    ['reachTargetPct', 'Reach Target %'],
  ]

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Church-Wide Stats</h2>
      <div className="body-muted" style={{ marginBottom: 20 }}>
        These feed the People &amp; Growth screen and several dashboard roll-ups.
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {fields.map(([key, label]) => (
          <Field key={key} label={label}>
            <input type="number" style={sheetInputStyle} value={form[key]} onChange={set(key)} />
          </Field>
        ))}
      </div>
      {error && <div style={{ marginTop: 16, color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 20 }}>
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </SheetButton>
        {savedFlash && <span style={{ color: 'var(--status-on-target)', fontSize: 13, fontWeight: 600 }}>Saved ✓</span>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Area People — edit-only (Main Church + 3 Extension Churches; areas
// themselves aren't created/deleted here, that's a Barangays-tab job).
// ---------------------------------------------------------------------
function AreaPeopleSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)

  return (
    <div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Area', 'Membership', 'Attendance', 'First Timers', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.areaPeopleStats.map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.areaName}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: a.isMainChurch ? '#0a3d66' : '#2f6690',
                    }}
                  >
                    {a.isMainChurch ? 'Main Church' : 'Extension Church'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>
                  {a.membershipActual} / {a.membershipTarget}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>
                  {a.attendanceActual.toFixed(0)} / {a.attendanceTarget.toFixed(0)}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>
                  {a.firstTimersActual} / {a.firstTimersTarget}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <IconButton title="Edit" onClick={() => setSheet(a)}>
                    ✏️
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet && (
        <AreaPeopleSheet
          area={sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function AreaPeopleSheet({ area, onClose, onSaved }) {
  const [form, setForm] = useState({
    membershipTarget: area.membershipTarget,
    membershipActual: area.membershipActual,
    activeMembershipTarget: area.activeMembershipTarget,
    activeMembershipActual: area.activeMembershipActual,
    attendanceTarget: area.attendanceTarget,
    attendanceActual: area.attendanceActual,
    firstTimersTarget: area.firstTimersTarget,
    firstTimersActual: area.firstTimersActual,
    fullTimeWorkers: area.fullTimeWorkers,
    partTimeWorkers: area.partTimeWorkers,
    volunteerWorkers: area.volunteerWorkers,
    totalWorkers: area.totalWorkers,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateAreaPeopleStats(area.id, form)
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const groups = [
    ['Membership', 'membershipTarget', 'membershipActual'],
    ['Active Membership', 'activeMembershipTarget', 'activeMembershipActual'],
    ['Attendance', 'attendanceTarget', 'attendanceActual'],
    ['First Timers', 'firstTimersTarget', 'firstTimersActual'],
  ]

  return (
    <FormSheet title={area.areaName} subtitle={area.isMainChurch ? 'Main Church' : 'Extension Church'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(([label, targetKey, actualKey]) => (
          <div key={label}>
            <div className="label" style={{ marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Field label="Target">
                  <input type="number" style={sheetInputStyle} value={form[targetKey]} onChange={set(targetKey)} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Actual">
                  <input type="number" style={sheetInputStyle} value={form[actualKey]} onChange={set(actualKey)} />
                </Field>
              </div>
            </div>
          </div>
        ))}

        <div>
          <div className="label" style={{ marginBottom: 6 }}>
            Workers
          </div>
          <div className="body-muted" style={{ marginBottom: 8, fontSize: 12 }}>
            Headcounts only — the source data doesn't track a separate target vs. actual for workers.
          </div>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            <Field label="Full-time">
              <input type="number" style={sheetInputStyle} value={form.fullTimeWorkers} onChange={set('fullTimeWorkers')} />
            </Field>
            <Field label="Part-time">
              <input type="number" style={sheetInputStyle} value={form.partTimeWorkers} onChange={set('partTimeWorkers')} />
            </Field>
            <Field label="Volunteer">
              <input type="number" style={sheetInputStyle} value={form.volunteerWorkers} onChange={set('volunteerWorkers')} />
            </Field>
            <Field label="Total Workers">
              <input type="number" style={sheetInputStyle} value={form.totalWorkers} onChange={set('totalWorkers')} />
            </Field>
          </div>
        </div>

        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// Life Groups — table + add/edit/delete.
// ---------------------------------------------------------------------
function LifeGroupsSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null) // null | 'new' | group object being edited
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(g) {
    if (!confirm(`Delete "${g.name}"? This can't be undone.`)) return
    setDeletingId(g.id)
    try {
      await deleteLifeGroup(g.id)
      await refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <AddButton onClick={() => setSheet('new')} label="+ Add Life Group" />
      </div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Group', 'Ministry Area', 'Barangay', 'Leader', 'Target', 'Actual', 'Status', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.lifeGroups.map((g) => (
              <tr key={g.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13.5 }}>{g.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.district}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.barangay}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.leader}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.targetHeadcount}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{g.actualHeadcount}</td>
                <td style={{ padding: '10px 14px' }}>
                  <StatusBadge status={g.status} compact />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconButton title="Edit" onClick={() => setSheet(g)}>
                      ✏️
                    </IconButton>
                    <IconButton title="Delete" onClick={() => handleDelete(g)}>
                      {deletingId === g.id ? '...' : '🗑️'}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet && (
        <LifeGroupSheet
          group={sheet === 'new' ? null : sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function LifeGroupSheet({ group, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: group?.name || '',
    district: group?.district || '',
    barangay: group?.barangay || '',
    leader: group?.leader || '',
    targetHeadcount: group?.targetHeadcount ?? '',
    actualHeadcount: group?.actualHeadcount ?? '',
    leadersTarget: group?.leadersTarget ?? '',
    leadersActual: group?.leadersActual ?? '',
    attendanceTarget: group?.attendanceTarget ?? '',
    attendanceActual: group?.attendanceActual ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim() || !form.barangay.trim()) {
      setError('Name and barangay are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (group) {
        await updateLifeGroup(group.id, form)
      } else {
        await createLifeGroup(form)
      }
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <FormSheet title={group ? 'Edit Life Group' : 'Add Life Group'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Name">
          <input style={sheetInputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Sta. Rita" />
        </Field>
        <Field label="Ministry Area">
          <input style={sheetInputStyle} value={form.district} onChange={set('district')} placeholder="e.g. Extension Church" />
        </Field>
        <Field label="Barangay">
          <input style={sheetInputStyle} value={form.barangay} onChange={set('barangay')} placeholder="Must match a real barangay name" />
        </Field>
        <Field label="Leader / Group Count">
          <input style={sheetInputStyle} value={form.leader} onChange={set('leader')} placeholder="e.g. 57 Groups, or a name" />
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Target Headcount">
              <input type="number" style={sheetInputStyle} value={form.targetHeadcount} onChange={set('targetHeadcount')} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Actual Headcount">
              <input type="number" style={sheetInputStyle} value={form.actualHeadcount} onChange={set('actualHeadcount')} />
            </Field>
          </div>
        </div>
        {group && (
          <>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Field label="LG Leaders — Target">
                  <input type="number" style={sheetInputStyle} value={form.leadersTarget} onChange={set('leadersTarget')} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="LG Leaders — Actual">
                  <input type="number" style={sheetInputStyle} value={form.leadersActual} onChange={set('leadersActual')} />
                </Field>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Field label="LG Attendance — Target">
                  <input type="number" style={sheetInputStyle} value={form.attendanceTarget} onChange={set('attendanceTarget')} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="LG Attendance — Actual">
                  <input type="number" style={sheetInputStyle} value={form.attendanceActual} onChange={set('attendanceActual')} />
                </Field>
              </div>
            </div>
          </>
        )}
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : group ? 'Save Changes' : 'Add Life Group'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// Financial — table + add/edit/delete.
// ---------------------------------------------------------------------
function FinancialSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(c) {
    if (!confirm(`Delete "${c.name}"? This can't be undone.`)) return
    setDeletingId(c.id)
    try {
      await deleteFinancialCategory(c.id)
      await refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <AddButton onClick={() => setSheet('new')} label="+ Add Category" />
      </div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Category', 'Target', 'Actual', 'Status', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.financialCategories.map((c) => (
              <tr key={c.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13.5 }}>{c.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>₱{commas(c.target)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>₱{commas(c.actual)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <StatusBadge status={c.status} compact />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconButton title="Edit" onClick={() => setSheet(c)}>
                      ✏️
                    </IconButton>
                    <IconButton title="Delete" onClick={() => handleDelete(c)}>
                      {deletingId === c.id ? '...' : '🗑️'}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet && (
        <FinancialSheet
          category={sheet === 'new' ? null : sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function FinancialSheet({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: category?.name || '',
    target: category?.target ?? '',
    actual: category?.actual ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Category name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (category) {
        await updateFinancialCategory(category.id, form)
      } else {
        await createFinancialCategory(form)
      }
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <FormSheet title={category ? 'Edit Category' : 'Add Financial Category'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Category Name">
          <input style={sheetInputStyle} value={form.name} onChange={set('name')} placeholder="e.g. Tithes" />
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Target (₱)">
              <input type="number" style={sheetInputStyle} value={form.target} onChange={set('target')} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Actual (₱)">
              <input type="number" style={sheetInputStyle} value={form.actual} onChange={set('actual')} />
            </Field>
          </div>
        </div>
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : category ? 'Save Changes' : 'Add Category'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// Area Financial — edit-only, same pattern as Area People.
// ---------------------------------------------------------------------
function AreaFinancialSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)

  return (
    <div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Area', 'Tithes', 'Offerings', 'Mission Offering', 'Pledges', 'Total Giving', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.areaFinancialStats.map((a) => (
              <tr key={a.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.areaName}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: a.isMainChurch ? '#0a3d66' : '#2f6690' }}>
                    {a.isMainChurch ? 'Main Church' : 'Extension Church'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{commas(a.tithesActual)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{commas(a.offeringsActual)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{commas(a.missionOfferingActual)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{commas(a.pledgesActual)}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5, fontWeight: 700 }}>{commas(a.totalGivingActual)}</td>
                <td style={{ padding: '10px 14px' }}>
                  <IconButton title="Edit" onClick={() => setSheet(a)}>
                    ✏️
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet && (
        <AreaFinancialSheet
          area={sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function AreaFinancialSheet({ area, onClose, onSaved }) {
  const [form, setForm] = useState({
    tithesTarget: area.tithesTarget,
    tithesActual: area.tithesActual,
    offeringsTarget: area.offeringsTarget,
    offeringsActual: area.offeringsActual,
    missionOfferingTarget: area.missionOfferingTarget,
    missionOfferingActual: area.missionOfferingActual,
    pledgesTarget: area.pledgesTarget,
    pledgesActual: area.pledgesActual,
    totalGivingTarget: area.totalGivingTarget,
    totalGivingActual: area.totalGivingActual,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateAreaFinancialStats(area.id, form)
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const groups = [
    ['Tithes', 'tithesTarget', 'tithesActual'],
    ['Offerings', 'offeringsTarget', 'offeringsActual'],
    ['Mission Offering', 'missionOfferingTarget', 'missionOfferingActual'],
    ['Pledges', 'pledgesTarget', 'pledgesActual'],
    ['Total Giving', 'totalGivingTarget', 'totalGivingActual'],
  ]

  return (
    <FormSheet title={area.areaName} subtitle={area.isMainChurch ? 'Main Church' : 'Extension Church'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(([label, targetKey, actualKey]) => (
          <div key={label}>
            <div className="label" style={{ marginBottom: 6 }}>
              {label} (₱)
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <Field label="Target">
                  <input type="number" style={sheetInputStyle} value={form[targetKey]} onChange={set(targetKey)} />
                </Field>
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Actual">
                  <input type="number" style={sheetInputStyle} value={form[actualKey]} onChange={set(actualKey)} />
                </Field>
              </div>
            </div>
          </div>
        ))}
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// Barangays — edit only (the 37 barangays are fixed geography, no
// add/delete). Includes a search box since there are 37 rows.
// ---------------------------------------------------------------------
function BarangaysSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = data.barangays.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search barangays..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...sheetInputStyle, maxWidth: 280 }}
        />
      </div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Barangay', 'Area', 'Status', 'People Reached', 'Life Groups', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13.5 }}>{b.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{b.area}</td>
                <td style={{ padding: '10px 14px' }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      color: b.isMainChurch
                        ? '#072844'
                        : b.extensionChurch
                          ? '#204a68'
                          : b.reached && b.active === false
                            ? '#5c7a94'
                            : b.reached
                              ? '#3f6d8f'
                              : '#8095a8',
                      background: b.isMainChurch
                        ? '#dce9f5'
                        : b.extensionChurch
                          ? '#e6eef5'
                          : b.reached && b.active === false
                            ? '#eef3f7'
                            : b.reached
                              ? '#e3ecf3'
                              : '#f2f6f9',
                    }}
                  >
                    {b.isMainChurch
                      ? 'Main Church'
                      : b.extensionChurch
                        ? 'Extension Church'
                        : b.reached && b.active === false
                          ? 'Reached (Inactive)'
                          : b.reached
                            ? 'Reached (Active)'
                            : 'Not Reached'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{b.reached ? b.peopleReached : '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{b.reached ? b.lifeGroups : '—'}</td>
                <td style={{ padding: '10px 14px' }}>
                  <IconButton title="Edit" onClick={() => setSheet(b)}>
                    ✏️
                  </IconButton>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '20px 14px', textAlign: 'center' }} className="body-muted">
                  No barangays match "{search}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sheet && (
        <BarangaySheet
          barangay={sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function BarangaySheet({ barangay, onClose, onSaved }) {
  const [form, setForm] = useState({
    reached: barangay.reached,
    extensionChurch: barangay.extensionChurch,
    isMainChurch: barangay.isMainChurch,
    active: barangay.active,
    peopleReached: barangay.peopleReached,
    firstTimers: barangay.firstTimers,
    lifeGroups: barangay.lifeGroups,
    outreachActivities: barangay.outreachActivities,
    householdsReached: barangay.householdsReached,
    growthPct: barangay.growthPct,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }
  function setChecked(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.checked }))
  }
  // Main Church and Extension Church are mutually exclusive statuses —
  // checking one clears the other, rather than letting a barangay claim
  // both at once.
  function setMainChurch(e) {
    const checked = e.target.checked
    setForm((f) => ({ ...f, isMainChurch: checked, extensionChurch: checked ? false : f.extensionChurch }))
  }
  function setExtensionChurch(e) {
    const checked = e.target.checked
    setForm((f) => ({ ...f, extensionChurch: checked, isMainChurch: checked ? false : f.isMainChurch }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateBarangay(barangay.id, form)
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const numberFields = [
    ['peopleReached', 'People Reached'],
    ['firstTimers', 'First Timers'],
    ['lifeGroups', 'Life Groups'],
    ['outreachActivities', 'Outreach Activities'],
    ['householdsReached', 'Households Reached'],
    ['growthPct', 'Growth %'],
  ]

  return (
    <FormSheet title={barangay.name} subtitle={barangay.area} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.reached} onChange={setChecked('reached')} />
            Reached
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.isMainChurch} onChange={setMainChurch} />
            Main Church
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={form.extensionChurch} onChange={setExtensionChurch} />
            Extension Church
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 14,
              opacity: form.reached ? 1 : 0.4,
            }}
          >
            <input
              type="checkbox"
              checked={form.active}
              disabled={!form.reached}
              onChange={setChecked('active')}
            />
            Active {!form.reached && <span className="caption">(only applies when Reached)</span>}
          </label>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {numberFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <input type="number" style={sheetInputStyle} value={form[key]} onChange={set(key)} />
            </Field>
          ))}
        </div>
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// Management Attention — list + add/edit/delete.
// ---------------------------------------------------------------------
const SEVERITY_OPTIONS = [
  [KPI_STATUS.CRITICAL, 'Critical'],
  [KPI_STATUS.ATTENTION, 'Needs Attention'],
  [KPI_STATUS.ON_TARGET, 'On Target'],
]

function AttentionSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(item) {
    if (!confirm(`Delete "${item.title}"? This can't be undone.`)) return
    setDeletingId(item.id)
    try {
      await deleteAttentionItem(item.id)
      await refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <AddButton onClick={() => setSheet('new')} label="+ Add Item" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.attentionItems.map((item) => (
          <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StatusBadge status={item.severity} compact />
                <span className="caption">{item.area}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginTop: 6 }}>{item.title}</div>
              <div className="body-muted" style={{ marginTop: 2 }}>
                {item.detail}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <IconButton title="Edit" onClick={() => setSheet(item)}>
                ✏️
              </IconButton>
              <IconButton title="Delete" onClick={() => handleDelete(item)}>
                {deletingId === item.id ? '...' : '🗑️'}
              </IconButton>
            </div>
          </div>
        ))}
      </div>

      {sheet && (
        <AttentionSheet
          item={sheet === 'new' ? null : sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

function AttentionSheet({ item, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: item?.title || '',
    detail: item?.detail || '',
    severity: item?.severity || KPI_STATUS.ATTENTION,
    area: item?.area || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.title.trim() || !form.detail.trim()) {
      setError('Title and detail are both required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (item) {
        await updateAttentionItem(item.id, form)
      } else {
        await createAttentionItem(form)
      }
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <FormSheet title={item ? 'Edit Attention Item' : 'Add Attention Item'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Title">
          <input style={sheetInputStyle} value={form.title} onChange={set('title')} placeholder="Short headline" />
        </Field>
        <Field label="Detail">
          <textarea
            style={{ ...sheetInputStyle, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }}
            value={form.detail}
            onChange={set('detail')}
            placeholder="One or two sentences of context"
          />
        </Field>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Severity">
              <select style={sheetInputStyle} value={form.severity} onChange={set('severity')}>
                {SEVERITY_OPTIONS.map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Area">
              <input style={sheetInputStyle} value={form.area} onChange={set('area')} placeholder="e.g. Financial" />
            </Field>
          </div>
        </div>
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : item ? 'Save Changes' : 'Add Item'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}

// ---------------------------------------------------------------------
// KPIs — list + add/edit/delete (target, actual, unit, period; trend
// data isn't editable here since it's a time series, not a single value).
// ---------------------------------------------------------------------
const FREQUENCIES = ['Weekly', 'Monthly', 'Quarterly', 'Annual']

function KpisSection() {
  const { data, refetch } = useAppData()
  const [sheet, setSheet] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function handleDelete(kpi) {
    if (!confirm(`Delete "${kpi.name}"? This can't be undone.`)) return
    setDeletingId(kpi.id)
    try {
      await deleteKpi(kpi.id)
      await refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <AddButton onClick={() => setSheet('new')} label="+ New KPI" />
      </div>
      <div className="card" style={{ padding: 8, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
          <thead>
            <tr style={{ background: 'var(--surface-muted)' }}>
              {['Name', 'Category', 'Target', 'Actual', 'Period', 'Status', ''].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.allKpis.map((k) => (
              <tr key={k.id} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13.5 }}>{k.name}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{k.category}</td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>
                  {k.unit === '₱' ? '₱' : ''}
                  {commas(k.target)}
                  {k.unit === '%' ? '%' : ''}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>
                  {k.unit === '₱' ? '₱' : ''}
                  {commas(k.actual)}
                  {k.unit === '%' ? '%' : ''}
                </td>
                <td style={{ padding: '10px 14px', fontSize: 13.5 }}>{k.period}</td>
                <td style={{ padding: '10px 14px' }}>
                  <StatusBadge status={k.status} compact />
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <IconButton title="Edit" onClick={() => setSheet(k)}>
                      ✏️
                    </IconButton>
                    <IconButton title="Delete" onClick={() => handleDelete(k)}>
                      {deletingId === k.id ? '...' : '🗑️'}
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sheet && (
        <KpiSheet
          kpi={sheet === 'new' ? null : sheet}
          onClose={() => setSheet(null)}
          onSaved={async () => {
            await refetch()
            setSheet(null)
          }}
        />
      )}
    </div>
  )
}

const CATEGORIES = ['People & Growth', 'Life Groups', 'Outreach', 'Financial', 'Ministry']

function KpiSheet({ kpi, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: kpi?.name || '',
    category: kpi?.category || CATEGORIES[0],
    target: kpi?.target ?? '',
    actual: kpi?.actual ?? '',
    unit: kpi?.unit || '',
    period: kpi?.period || FREQUENCIES[1],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function set(key) {
    return (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('KPI name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (kpi) {
        await updateKpi(kpi.id, form)
      } else {
        await createKpiTarget({ name: form.name, category: form.category, target: form.target, frequency: form.period })
      }
      await onSaved()
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <FormSheet title={kpi ? 'Edit KPI' : 'New KPI Target'} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="KPI Name">
          <input style={sheetInputStyle} value={form.name} onChange={set('name')} placeholder="e.g. First Timers" disabled={!!kpi} />
        </Field>
        {!kpi && (
          <Field label="Category">
            <select style={sheetInputStyle} value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        )}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Target">
              <input type="number" style={sheetInputStyle} value={form.target} onChange={set('target')} />
            </Field>
          </div>
          {kpi && (
            <div style={{ flex: 1 }}>
              <Field label="Actual">
                <input type="number" style={sheetInputStyle} value={form.actual} onChange={set('actual')} />
              </Field>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <Field label="Unit">
              <select style={sheetInputStyle} value={form.unit} onChange={set('unit')}>
                <option value="">(none)</option>
                <option value="₱">₱ (peso)</option>
                <option value="%">% (percent)</option>
              </select>
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Period">
              <select style={sheetInputStyle} value={form.period} onChange={set('period')}>
                {FREQUENCIES.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        {error && <div style={{ color: 'var(--status-critical)', fontSize: 13 }}>{error}</div>}
        <SheetButton onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : kpi ? 'Save Changes' : 'Create Target'}
        </SheetButton>
      </div>
    </FormSheet>
  )
}
