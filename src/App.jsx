import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { LoadingState, ErrorState } from './components/LoadingError'
import { DataProvider, useAppData } from './context/DataContext'
import { PeriodProvider } from './context/PeriodContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import NotificationBell from './components/NotificationBell'
import Login from './screens/Login'
import PendingApproval from './screens/PendingApproval'
import Dashboard from './screens/Dashboard'
import PeopleGrowth from './screens/PeopleGrowth'
import LifeGroups from './screens/LifeGroups'
import GeographicReach from './screens/GeographicReach'
import Financial from './screens/Financial'
import KpiCenter from './screens/KpiCenter'
import Reports from './screens/Reports'
import ManagementAttention from './screens/ManagementAttention'
import Admin from './screens/Admin'
import DataEntry from './screens/DataEntry'

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  )
}

// Only mounts DataProvider/PeriodProvider (which fetch app data) once
// we know the user is signed in AND has an assigned role — fetching
// earlier would just hit RLS-blocked empty results and look like a
// broken app instead of a clean "please sign in" experience.
function AuthGate() {
  const { session, isPending, loading } = useAuth()

  if (loading) return <LoadingState label="Loading Shepherd OS..." />
  if (!session) return <Login />
  if (isPending) return <PendingApproval />

  return (
    <DataProvider>
      <PeriodProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppShell />
          </BrowserRouter>
        </NotificationProvider>
      </PeriodProvider>
    </DataProvider>
  )
}

// Admin Console is reachable by anyone with edit rights on at least one
// resource — not just Admin/Pastor+MIS. RLS still blocks their actual
// writes per-table according to their real permissions; this just keeps
// someone with zero edit rights anywhere from landing on a page full of
// controls that would silently fail for them.
const RESOURCES = ['membership', 'life_groups', 'outreach', 'financial', 'attention', 'kpis', 'admin']

function AppShell() {
  const width = useWindowWidth()
  const collapsed = width < 900 && width >= 640
  const mobile = width < 640
  const { loading, error, refetch } = useAppData()
  const { canEdit, canView } = useAuth()
  const canAccessAdmin = RESOURCES.some((r) => canEdit(r))
  const canAccessDataEntry = canView('data_entry')

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!mobile && <Sidebar collapsed={collapsed} />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: mobile ? '12px 16px 0' : '16px 24px 0' }}>
          <NotificationBell />
        </div>
        {loading ? (
          <LoadingState label="Loading Shepherd OS..." />
        ) : error ? (
          <ErrorState message={error} onRetry={refetch} />
        ) : (
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/people" element={<PeopleGrowth />} />
            <Route path="/life-groups" element={<LifeGroups />} />
            <Route path="/outreach" element={<GeographicReach />} />
            <Route path="/financial" element={<Financial />} />
            <Route path="/kpi-center" element={<KpiCenter />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/attention" element={<ManagementAttention />} />
            <Route path="/data-entry" element={canAccessDataEntry ? <DataEntry /> : <Navigate to="/" replace />} />
            <Route path="/admin" element={canAccessAdmin ? <Admin /> : <Navigate to="/" replace />} />
          </Routes>
        )}
        {mobile && !loading && !error && <MobileNav />}
      </div>
    </div>
  )
}

// Same screen list and resource-gating as Sidebar.jsx — mobile users
// should be able to reach every screen their role allows, not a
// hardcoded subset. Previously this list only had 5 fixed items and
// ignored permissions entirely, meaning Financial, KPI Center, Reports,
// Data Entry, and Admin Console were unreachable on mobile regardless
// of role.
const MOBILE_NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: '▦', resource: null },
  { to: '/people', label: 'Membership', icon: '◔', resource: 'membership' },
  { to: '/life-groups', label: 'Life Groups', icon: '◈', resource: 'life_groups' },
  { to: '/outreach', label: 'Outreach', icon: '⬡', resource: 'outreach' },
  { to: '/financial', label: 'Financial', icon: '$', resource: 'financial' },
  { to: '/kpi-center', label: 'KPI Center', icon: '◎', resource: 'kpis' },
  { to: '/reports', label: 'Reports', icon: '▤', resource: 'reports' },
  { to: '/attention', label: 'Attention', icon: '!', resource: 'attention' },
  { to: '/data-entry', label: 'Data Entry', icon: '✎', resource: 'data_entry' },
  { to: '/admin', label: 'Admin Console', icon: '⚙', resource: 'admin' },
]

function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { canView, canEdit } = useAuth()

  const items = MOBILE_NAV_ITEMS.filter((item) => {
    if (item.resource === null) return true
    if (item.to === '/admin') return RESOURCES.some((r) => canEdit(r))
    return canView(item.resource)
  })

  const currentIndex = Math.max(
    0,
    items.findIndex((item) => item.to === location.pathname),
  )
  const current = items[currentIndex]
  const goTo = (delta) => {
    const nextIndex = (currentIndex + delta + items.length) % items.length
    navigate(items[nextIndex].to)
  }

  if (!current) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        padding: '10px 6px calc(10px + env(safe-area-inset-bottom, 0px))',
        zIndex: 100,
      }}
    >
      <button
        onClick={() => goTo(-1)}
        aria-label="Previous screen"
        style={{ background: 'none', border: 'none', fontSize: 20, padding: '8px 14px', color: 'var(--ink-muted)', cursor: 'pointer' }}
      >
        ‹
      </button>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--primary)' }}>
        <span style={{ fontSize: 18 }}>{current.icon}</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{current.label}</span>
      </div>
      <button
        onClick={() => goTo(1)}
        aria-label="Next screen"
        style={{ background: 'none', border: 'none', fontSize: 20, padding: '8px 14px', color: 'var(--ink-muted)', cursor: 'pointer' }}
      >
        ›
      </button>
    </div>
  )
}
