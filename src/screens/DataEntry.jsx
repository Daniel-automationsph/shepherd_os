import { useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import { sheetInputStyle } from '../components/FormSheet'
import { useAppData } from '../context/DataContext'
import { updateAreaPeopleStats, updateAreaFinancialStats, updateLifeGroup } from '../data/api'

// Each field maps to one of the 3 underlying tables — Data Entry writes
// to the same real tables Admin Console does, just through a faster,
// per-church, actual-figures-only form meant for Church Coordinators.
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

export default function DataEntry() {
  const { data } = useAppData()
  const { areaPeopleStats, areaFinancialStats, lifeGroups } = data

  // Join the 3 tables by area name into one row per church, since this
  // screen shows one combined card per church rather than separate
  // sections per table the way Admin Console does.
  const churches = (areaPeopleStats || []).map((people) => {
    const financial = (areaFinancialStats || []).find((f) => f.areaName === people.areaName)
    const lifeGroup = (lifeGroups || []).find((lg) => lg.name === people.areaName)
    return { areaName: people.areaName, isMainChurch: people.isMainChurch, people, financial, lifeGroup }
  })

  return (
    <div className="scroll-page">
      <SectionHeader title="Data Entry" subtitle="Enter actual figures for each church — targets are managed in Admin Console." />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {churches.map((church) => (
          <ChurchCard key={church.areaName} church={church} />
        ))}
      </div>
    </div>
  )
}

function ChurchCard({ church }) {
  const { refetch } = useAppData()
  const { areaName, isMainChurch, people, financial, lifeGroup } = church

  const [form, setForm] = useState({
    attendance: people?.attendanceActual ?? '',
    firstTimers: people?.firstTimersActual ?? '',
    tithes: financial?.tithesActual ?? '',
    offerings: financial?.offeringsActual ?? '',
    pledges: financial?.pledgesActual ?? '',
    missionOffering: financial?.missionOfferingActual ?? '',
    support: financial?.supportActual ?? '',
    numberOfTithers: people?.numberOfTithersActual ?? '',
    lgAttendance: lifeGroup?.attendanceActual ?? '',
    lgFirstTimers: lifeGroup?.firstTimersActual ?? '',
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
      if (people) {
        await updateAreaPeopleStats(people.id, {
          attendanceActual: form.attendance,
          firstTimersActual: form.firstTimers,
          numberOfTithersActual: form.numberOfTithers,
        })
      }
      if (financial) {
        await updateAreaFinancialStats(financial.id, {
          tithesActual: form.tithes,
          offeringsActual: form.offerings,
          pledgesActual: form.pledges,
          missionOfferingActual: form.missionOffering,
          supportActual: form.support,
        })
      }
      if (lifeGroup) {
        // updateLifeGroup requires the full record (name/district/
        // barangay/leader/headcount) even for a partial-looking update —
        // it doesn't safely support omitting them, so the complete
        // current record is passed through with just these 2 fields
        // changed, to avoid accidentally clearing anything else.
        await updateLifeGroup(lifeGroup.id, {
          name: lifeGroup.name,
          district: lifeGroup.district,
          barangay: lifeGroup.barangay,
          leader: lifeGroup.leader,
          targetHeadcount: lifeGroup.targetHeadcount,
          actualHeadcount: lifeGroup.actualHeadcount,
          leadersTarget: lifeGroup.leadersTarget,
          leadersActual: lifeGroup.leadersActual,
          attendanceTarget: lifeGroup.attendanceTarget,
          attendanceActual: form.lgAttendance,
          firstTimersTarget: lifeGroup.firstTimersTarget,
          firstTimersActual: form.lgFirstTimers,
          demographics: lifeGroup.demographics,
        })
      }
      await refetch()
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
        {FIELDS.map(([key, label]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1, fontSize: 13 }}>{label}</div>
            <input type="number" value={form[key]} onChange={set(key)} style={{ ...sheetInputStyle, width: 110 }} />
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: 'var(--status-critical)', fontSize: 13, marginTop: 10 }}>{error}</div>
      )}

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
        {saving ? 'Saving...' : savedFlash ? 'Saved ✓' : 'Save'}
      </button>
    </div>
  )
}
