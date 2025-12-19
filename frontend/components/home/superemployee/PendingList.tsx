'use client'

import React from 'react'
import Link from 'next/link'

export default function PendingList({ items }: { items: { id: number; title: string; by?: string }[] }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No pending items.</div>

  return (
    <ul className="space-y-3">
      {items.map(item => (
        <li key={item.id} className="flex items-center justify-between p-3 border rounded-md hover:shadow-sm hover:bg-gray-50 transition">
          <div className="min-w-0">
            <div className="font-medium truncate">{item.title}</div>
            {item.by && <div className="text-sm text-gray-500 truncate">from {item.by}</div>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/admin/submissions#${item.id}`} className="px-3 py-1 text-sm bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100">Review</Link>
            <button onClick={() => alert('Approve (frontend only)')} className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:opacity-95">Approve</button>
          </div>
        </li>
      ))}
    </ul>
  )
}
