import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp, error } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [signupDone, setSignupDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    if (mode === 'signin') {
      await signIn(email, password)
    } else {
      const result = await signUp(email, password, fullName)
      if (result.ok) setSignupDone(true)
    }
    setSubmitting(false)
  }

  if (signupDone) {
    return (
      <AuthShell>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Check your email</h1>
        <p className="body-muted" style={{ marginBottom: 16 }}>
          We sent a confirmation link to <strong>{email}</strong>. Once confirmed, an Admin still needs to assign your
          role before you can see any data — you'll see a "waiting for approval" screen after signing in until then.
        </p>
        <button
          onClick={() => {
            setSignupDone(false)
            setMode('signin')
          }}
          style={linkButtonStyle}
        >
          Back to sign in
        </button>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{mode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
      <p className="body-muted" style={{ marginBottom: 20 }}>
        Shepherd OS — JIL Pinamalayan
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'signup' && (
          <Field label="Full Name">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required style={inputStyle} />
          </Field>
        )}
        <Field label="Email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </Field>
        <Field label="Password">
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} style={inputStyle} />
        </Field>

        {error && (
          <div style={{ fontSize: 13, color: 'var(--status-critical)', background: 'var(--status-critical-bg)', padding: '8px 12px', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '11px 0',
            borderRadius: 8,
            border: 'none',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: 14,
            cursor: submitting ? 'default' : 'pointer',
            opacity: submitting ? 0.7 : 1,
            marginTop: 6,
          }}
        >
          {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div style={{ marginTop: 18, textAlign: 'center' }}>
        {mode === 'signin' ? (
          <button onClick={() => setMode('signup')} style={linkButtonStyle}>
            New here? Create an account
          </button>
        ) : (
          <button onClick={() => setMode('signin')} style={linkButtonStyle}>
            Already have an account? Sign in
          </button>
        )}
      </div>
    </AuthShell>
  )
}

function AuthShell({ children }) {
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
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <div className="label" style={{ marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--surface-muted)',
  fontSize: 14,
  fontFamily: 'inherit',
}

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--primary)',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'underline',
}
