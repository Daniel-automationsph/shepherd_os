/** Reusable bottom-sheet modal used by every Admin Console form. */
export default function FormSheet({ title, subtitle, onClose, children, maxWidth = 480 }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30,42,34,0.35)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          padding: '20px 24px 28px',
          width: '100%',
          maxWidth,
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--line)', margin: '0 auto 16px' }} />
        <h1 className="serif" style={{ fontSize: 20, fontWeight: 700 }}>
          {title}
        </h1>
        {subtitle && (
          <div className="body-muted" style={{ marginTop: 4, marginBottom: 20 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export const sheetInputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: 'none',
  background: 'var(--surface-muted)',
  fontSize: 14,
  fontFamily: 'inherit',
}

export function SheetButton({ children, onClick, disabled, variant = 'primary' }) {
  const styles = {
    primary: { background: disabled ? 'var(--primary-light, #4c7a50)' : 'var(--primary)', color: 'white' },
    danger: { background: disabled ? '#e0a99a' : 'var(--status-critical)', color: 'white' },
    secondary: { background: 'var(--surface-muted)', color: 'var(--ink)' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '13px 20px',
        borderRadius: 10,
        border: 'none',
        fontWeight: 700,
        fontSize: 14,
        cursor: disabled ? 'default' : 'pointer',
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}
