'use client'

import { useCallback, useEffect, useState } from 'react'

export type User = { id?: number; username?: string; email?: string; role?: string }

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('admin_token')) : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch('/api/users/me', { headers })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        try { localStorage.setItem('user', JSON.stringify(data)) } catch {}
      } else {
        const stored = localStorage.getItem('user')
        if (stored) setUser(JSON.parse(stored))
        else setUser(null)
      }
    } catch (e) {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
      else setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMe()
    const onUserLogged = () => fetchMe()
    window.addEventListener('userLoggedIn', onUserLogged)
    return () => window.removeEventListener('userLoggedIn', onUserLogged)
  }, [fetchMe])

  return { user, loading, refresh: fetchMe }
}
