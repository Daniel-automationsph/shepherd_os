import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import { LoadingState, ErrorState } from './components/LoadingError'
import { DataProvider, useAppData } from './context/DataContext'
import Dashboard from './screens/Dashboard'
import PeopleGrowth from './screens/PeopleGrowth'
import LifeGroups from './screens/LifeGroups'
import GeographicReach from './screens/GeographicReach'
import Financial from './screens/Financial'
import KpiCenter from './screens/KpiCenter'
import Reports from './screens/Reports'
import ManagementAttention from './screens/ManagementAttention'

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
    <DataProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </DataProvider>
  )
}

function AppShell() {
  const width = useWindowWidth()
  const collapsed = width < 900 && width >= 640
  const mobile = width < 640
  const { loading, error, refetch } = useAppData()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!mobile && <Sidebar collapsed={collapsed} />}
      <div style={{ flex: 1, minWidth: 0 }}>
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
          </Routes>
        )}
        {mobile && !loading && !error && <MobileNav />}
      </div>
    </div>
  )
}

function MobileNav() {
  const items = [
    ['/', '▦', 'Dashboard'],
    ['/people', '◔', 'People'],
    ['/life-groups', '◈', 'Groups'],
    ['/outreach', '⬡', 'Outreach'],
    ['/attention', '!', 'More'],
  ]
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        background: 'var(--surface)',
        borderTop: '1px solid var(--line)',
        padding: '6px 0 calc(6px + env(safe-area-inset-bottom, 0px))',
        zIndex: 100,
      }}
    >
      {items.map(([to, icon, label]) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '6px 0',
            color: isActive ? 'var(--primary)' : 'var(--ink-muted)',
            textDecoration: 'none',
            fontSize: 10.5,
          })}
        >
          <span style={{ fontSize: 18 }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </div>
  )
}
