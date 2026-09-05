export default function SectionHeader({ title, subtitle, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 'var(--font-header)', fontWeight: 700, lineHeight: 1.2, overflowWrap: 'break-word' }}>
          {title}
        </h1>
        {subtitle && (
          <div className="body-muted" style={{ marginTop: 4, overflowWrap: 'break-word' }}>
            {subtitle}
          </div>
        )}
      </div>
      {trailing}
    </div>
  )
}
