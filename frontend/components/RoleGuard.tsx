'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../hooks/useAuth'

export default function RoleGuard({ allowed = [], children }: { allowed: string[]; children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return <div />

  const role = user?.role?.toLowerCase() || 'guest'
  if (allowed.length > 0 && !allowed.includes(role)) {
    if (typeof window !== 'undefined') router.push('/login')
    return null
  }

  return <>{children}</>
}
