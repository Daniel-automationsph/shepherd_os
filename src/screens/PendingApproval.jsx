import { useAuth } from '../context/AuthContext'

export default function PendingApproval() {
  const { user, signOut } = useAuth()

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        padding: 20,
      }}
    >
      <div className="card" style={{ width: '100%', maxWidth: 420, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Waiting for approval</h1>
        <p className="body-muted" style={{ marginBottom: 4 }}>
          Signed in as <strong>{user?.email}</strong>
        </p>
        <p className="body-muted" style={{ marginBottom: 20 }}>
          An Admin needs to assign your role before you can access Shepherd OS. Check back after they've set you up in
          Admin Console.
        </p>
        <button
          onClick={signOut}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            border: '1px solid var(--line)',
            background: 'var(--surface)',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
