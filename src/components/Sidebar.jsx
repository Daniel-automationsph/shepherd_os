import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/people', label: 'People', icon: '◔' },
  { to: '/life-groups', label: 'Life Groups', icon: '◈' },
  { to: '/outreach', label: 'Outreach', icon: '⬡' },
  { to: '/financial', label: 'Financial', icon: '$' },
  { to: '/kpi-center', label: 'KPI Center', icon: '◎' },
  { to: '/reports', label: 'Reports', icon: '▤' },
  { to: '/attention', label: 'Attention', icon: '!' },
]

export default function Sidebar({ collapsed }) {
  return (
    <div
      style={{
        width: collapsed ? 84 : 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: collapsed ? '22px 0' : '22px 20px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <img
          src="/pwa-512.png"
          alt="Shepherd OS"
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            flexShrink: 0,
            objectFit: 'contain',
          }}
        />
        {!collapsed && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.4 }}>SHEPHERD OS</div>
            <div className="caption">Pinamalayan, Or. Mindoro</div>
          </div>
        )}
      </div>
      <hr className="divider" />
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
              margin: collapsed ? '3px 14px' : '3px 12px',
              padding: '11px 10px',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? 'var(--primary)' : 'var(--ink-faint)',
              background: isActive ? 'rgba(47,82,51,0.08)' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13.5,
            })}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
