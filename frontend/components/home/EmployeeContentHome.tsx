'use client'

import Link from 'next/link'
import React from 'react'
import { can } from '../../lib/permissions'

export default function EmployeeContentHome({ user }: { user?: any }) {
  const role = String(user?.role || '').toLowerCase()

  const hasAccess = (action: string) => {
    // Allow explicit per-user permissions array if present, otherwise fallback to role map
    if (user?.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes(action)
    }
    return can(role, action)
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Creator Home</h1>
        <div className="text-sm text-gray-600">{user?.username || ''}</div>
      </header>

      {/* If the current user is a content creator we show a scoped dashboard.
          Admin-level pages (under /admin) are shown only when the role or
          per-user permissions allow it. */}
      {role === 'contentcreator' ? (
        <section className="mt-6 grid grid-cols-3 gap-4">
          <Link href="/employee/content/drafts" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">My Drafts</Link>
          <Link href="/employee/content/new" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">Create Promotion</Link>
          <Link href="/employee/content/tasks" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">My Tasks</Link>
        </section>
      ) : (
        <section className="mt-6 grid grid-cols-3 gap-4">
          {hasAccess('manage_forms') && (
            <Link href="/admin/form-builder" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">Create Form</Link>
          )}
          {hasAccess('review_submissions') && (
            <Link href="/admin/submissions" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">Review Submissions</Link>
          )}
          {hasAccess('edit_content') && (
            <Link href="/admin/promotions" className="p-4 bg-emerald-50 rounded shadow hover:bg-emerald-100">Promotions</Link>
          )}
        </section>
      )}

      <section className="mt-6">
        <h2 className="font-semibold">Drafts</h2>
        <div className="mt-3">No drafts</div>
      </section>
    </div>
  )
}
