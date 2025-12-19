'use client'

import Link from 'next/link'
import React from 'react'

export default function AdminHome({ user }: { user?: any }) {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Home</h1>
        <div className="text-sm text-gray-600">Signed in as {user?.username || 'Admin'}</div>
      </header>

      <section className="mt-6 grid grid-cols-3 gap-4">
        <Link href="/admin/users" className="p-4 bg-sky-50 rounded shadow hover:bg-sky-100">Manage Users</Link>
        <Link href="/admin/groups" className="p-4 bg-sky-50 rounded shadow hover:bg-sky-100">Manage Groups</Link>
        <Link href="/admin/form-builder" className="p-4 bg-sky-50 rounded shadow hover:bg-sky-100">Form Builder</Link>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Quick Metrics</h2>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="p-4 bg-pink-300 rounded shadow">Users: <strong>—</strong></div>
          <div className="p-4 bg-pink-300 rounded shadow">Orders: <strong>—</strong></div>
          <div className="p-4 bg-pink-300 rounded shadow">Forms: <strong>—</strong></div>
        </div>
      </section>
    </div>
  )
}
