'use client'

import Link from 'next/link'
import React from 'react'
import { FilePlus, List, Users, Clock, CheckSquare, Activity } from 'lucide-react'
import StatCard from './superemployee/StatCard'
import PendingList from './superemployee/PendingList'
import QuickActions from './superemployee/QuickActions'
import ActivityFeed from './superemployee/ActivityFeed'

type Props = { user?: any }

export default function SuperEmployeeHome({ user }: Props) {
  // Placeholder data — frontend-only UI
  const stats = [
    { id: 'forms', label: 'Forms Created', value: 12 },
    { id: 'pending', label: 'Pending Submissions', value: 4 },
    { id: 'approvals', label: 'Awaiting Approval', value: 2 },
  ]

  const recentActivity = [
    { id: 1, text: 'Reviewed submission #542', time: '2h' },
    { id: 2, text: 'Published promotion: Back-to-School', time: '1d' },
    { id: 3, text: 'Created form: Customer Feedback', time: '3d' },
  ]

  const pending = [
    { id: 542, title: 'Feedback form submission', by: 'alice@example.com' },
    { id: 543, title: 'New promo draft', by: 'bob@example.com' },
  ]

  return (
    <div>
      <header className="flex items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-pink-400">Super Employee Home</h1>
          <div className="text-sm text-gray-600">Welcome back{user?.username ? `, ${user.username}` : ''}</div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = '/admin/form-builder'} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transform hover:-translate-y-0.5 transition">
            <FilePlus className="w-4 h-4" />
            New Form
          </button>
          <button onClick={() => window.location.href = '/admin/submissions'} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-md shadow hover:bg-emerald-100 transform hover:-translate-y-0.5 transition">
            <List className="w-4 h-4" />
            Submissions
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map(s => (
          <StatCard key={s.id} label={s.label} value={s.value}>
            {s.id === 'forms' && <Activity className="w-6 h-6" />}
            {s.id === 'pending' && <Clock className="w-6 h-6" />}
            {s.id === 'approvals' && <CheckSquare className="w-6 h-6" />}
          </StatCard>
        ))}
      </section>

      {/* Main grid: left = pending, right = activity + quick links */}
      <section className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-pink-300">Pending Submissions</h2>
            <Link href="/admin/submissions" className="text-sm text-indigo-600">View all</Link>
          </div>
          <PendingList items={pending} />
        </div>

        <aside className="bg-white rounded-lg shadow-sm border p-4">
          <h3 className="text-lg font-semibold text-pink-400">Quick Actions</h3>
          <div className="mt-3">
            <QuickActions items={[
              { href: '/admin/form-builder', label: 'Open Form Builder' },
              { href: '/admin/groups', label: 'Manage Groups' },
              { href: '/admin/promotions', label: 'Promotions' },
            ]} />
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-semibold">Recent Activity</h4>
            <ActivityFeed items={recentActivity} />
          </div>
        </aside>
      </section>
    </div>
  )
}
