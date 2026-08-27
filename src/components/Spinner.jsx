/** Small rotating-ring spinner. `size` in px, `color` any CSS color. */
export default function Spinner({ size = 16, color = 'var(--primary)' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `${Math.max(2, size / 8)}px solid ${color}33`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'shepherd-spin 0.7s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

/** Full loading state with spinner + message, used for whole-section
 * loading states (Reports, Historical mode banners). */
export function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 40,
      }}
    >
      <Spinner size={26} />
      <div className="body-muted">{label}</div>
    </div>
  )
}
