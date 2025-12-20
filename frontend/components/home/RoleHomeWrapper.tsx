'use client'

import React from 'react'
import Link from 'next/link'

export default function RoleHomeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex gap-6">
          <aside className="w-64 bg-white rounded shadow p-4">
            <div className="mb-4 font-bold text-pink-400">Workspace</div>
            <nav className="flex flex-col gap-2 text-sm">
              <Link href="/home" className="text-sky-600">Home</Link>
              <Link href="/admin/dashboard" className="text-gray-600">Admin Dashboard</Link>
              <Link href="/account" className="text-gray-600">Account</Link>
            </nav>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded shadow p-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
