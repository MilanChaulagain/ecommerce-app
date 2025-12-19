'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '../../hooks/useAuth'
import RoleHomeWrapper from '../../components/home/RoleHomeWrapper'
import EmployeeSalesHome from '../../components/home/EmployeeSalesHome'
import EmployeeContentHome from '../../components/home/EmployeeContentHome'

export default function EmployeeLandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/home')
    }
  }, [loading, user, router])

  if (loading) return <div className="p-8">Loading...</div>

  const role = String(user?.role || '').toLowerCase()

  // Only allow employee subroles here; otherwise redirect to main home
  if (!['employee', 'salesemployee', 'contentcreator'].includes(role)) {
    router.push('/home')
    return null
  }

  let Component: any = EmployeeSalesHome
  if (role === 'contentcreator') Component = EmployeeContentHome
  if (role === 'employee') Component = EmployeeSalesHome

  return (
    <RoleHomeWrapper>
      <Component user={user} />
    </RoleHomeWrapper>
  )
}
