import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setNotifications([])
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('notifications')
      .select('id, sender_id, type, title, body, link, read, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      console.error(error)
      setNotifications([])
    } else {
      setNotifications(data)
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Real-time subscription — new notifications for this user appear
  // instantly without needing a refresh. Requires the `notifications`
  // table to have Realtime enabled in Supabase Dashboard → Database →
  // Replication (a manual step SQL alone can't guarantee — see
  // notifications.sql's comment at the bottom).
  useEffect(() => {
    if (!supabase || !user) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => prev.map((n) => (n.id === payload.new.id ? payload.new : n)))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const markAsRead = useCallback(
    async (id) => {
      if (!supabase) return
      // Optimistic — flips instantly in the UI, reconciled by the
      // real-time UPDATE event above once the write actually lands.
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
      if (error) console.error(error)
    },
    [],
  )

  const markAllAsRead = useCallback(async () => {
    if (!supabase || !user) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const { error } = await supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id).eq('read', false)
    if (error) console.error(error)
  }, [notifications, user])

  const unreadCount = notifications.filter((n) => !n.read).length

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: load,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider')
  return ctx
}
