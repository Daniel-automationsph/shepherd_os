export function LoadingState({ label = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--ink-muted)',
        fontSize: 14,
      }}
    >
      {label}
    </div>
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        minHeight: '60vh',
        padding: 24,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 700 }}>Couldn't load data</div>
      <div className="body-muted" style={{ maxWidth: 420 }}>
        {message}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '10px 18px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
