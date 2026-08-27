/** Pill-style Current/Historical switcher. "Current" = live editable
 * snapshot (via Admin Console). "Historical" = read-only figures for
 * whatever period is selected in the sidebar's Date Range picker. */
export default function ModeToggle({ mode, onChange }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: 'var(--surface-muted)',
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      {['Current', 'Historical'].map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          style={{
            padding: '7px 16px',
            borderRadius: 999,
            border: 'none',
            background: mode === m ? 'var(--surface)' : 'transparent',
            color: mode === m ? 'var(--primary)' : 'var(--ink-faint)',
            fontWeight: 700,
            fontSize: 12.5,
            cursor: 'pointer',
            boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {m}
        </button>
      ))}
    </div>
  )
}
