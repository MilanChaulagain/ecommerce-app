'use client'

import React from 'react'
import useAuth from '../../hooks/useAuth'
import RoleHomeWrapper from '../../components/home/RoleHomeWrapper'
import AdminHome from '../../components/home/AdminHome'
import SuperEmployeeHome from '../../components/home/SuperEmployeeHome'
import EmployeeSalesHome from '../../components/home/EmployeeSalesHome'
import EmployeeContentHome from '../../components/home/EmployeeContentHome'
import CustomerHomeV2 from '../../components/home/CustomerHomeV2'
import UserHomePage from '../../components/user/UserHomePage'

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-8">Loading...</div>

  const role = (user && user.role) ? user.role.toLowerCase() : 'guest'

  // Preserve the existing account/home experience (`UserHomePage`) for
  // regular customers and users — that component contains profile and
  // role-specific fragments already used at `/account`.
  if (['user', 'customer', 'guest'].includes(role)) {
    return <UserHomePage />
  }

  let Component: any = CustomerHomeV2
  switch (role) {
    case 'admin':
      Component = AdminHome
      break
    case 'superemployee':
      Component = SuperEmployeeHome
      break
    case 'salesemployee':
      Component = EmployeeSalesHome
      break
    case 'contentcreator':
      Component = EmployeeContentHome
      break
    default:
      Component = CustomerHomeV2
  }

  return (
    <RoleHomeWrapper>
      <Component user={user} />
    </RoleHomeWrapper>
  )
}
