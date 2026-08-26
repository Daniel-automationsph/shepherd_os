export default function SectionHeader({ title, subtitle, trailing }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
      <div style={{ flex: 1 }}>
        <h1 className="serif" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <div className="body-muted" style={{ marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {trailing}
    </div>
  )
}
