'use client'

import Link from 'next/link'
import React from 'react'

export default function EmployeeSalesHome({ user }: { user?: any }) {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <div className="text-sm text-gray-600">{user?.username || ''}</div>
      </header>

      <section className="mt-6">
        <h2 className="font-semibold">Today's Summary</h2>
        <div className="mt-3 grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded shadow">New Orders: <strong>0</strong></div>
          <div className="p-4 bg-white rounded shadow">Pending: <strong>0</strong></div>
          <div className="p-4 bg-white rounded shadow">Revenue: <strong>0</strong></div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Recent Orders</h2>
        <div className="mt-3 space-y-2">No recent orders</div>
      </section>

      <section className="mt-6">
        <Link href="/employee/orders" className="inline-block px-4 py-2 bg-sky-600 text-white rounded">Go to Orders</Link>
      </section>
    </div>
  )
}
