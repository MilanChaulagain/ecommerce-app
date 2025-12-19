'use client'

import React from 'react'

export default function ActivityFeed({ items }: { items: { id: number; text: string; time?: string }[] }) {
  if (!items || items.length === 0) return <div className="text-sm text-gray-500">No recent activity.</div>

  return (
    <ul className="space-y-3 text-sm text-gray-600">
      {items.map(a => (
        <li key={a.id} className="flex items-start gap-3">
          <div className="mt-1 w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
          <div>
            <div className="text-sm text-gray-700">{a.text}</div>
            {a.time && <div className="text-xs text-gray-400">{a.time} ago</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}
