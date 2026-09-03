import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null) // { id, full_name, role } — role is null while pending
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null)
      return
    }
    const { data, error: err } = await supabase.from('profiles').select('id, full_name, role').eq('id', userId).single()
    if (err) {
      console.error(err)
      setProfile(null)
      return
    }
    setProfile(data)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) {
        await loadProfile(newSession.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email, password) => {
    setError(null)
    if (!supabase) {
      setError('Supabase is not configured yet.')
      return { ok: false }
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const signUp = useCallback(async (email, password, fullName) => {
    setError(null)
    if (!supabase) {
      setError('Supabase is not configured yet.')
      return { ok: false }
    }
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (err) {
      setError(err.message)
      return { ok: false }
    }
    return { ok: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    // "pending" = signed in, but no role assigned yet — sees nothing
    // until an Admin assigns one via Admin Console → Users.
    isPending: !!session && !!profile && profile.role == null,
    role: profile?.role ?? null,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refetchProfile: () => session && loadProfile(session.user.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
