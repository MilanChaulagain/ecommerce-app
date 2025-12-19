'use client'

import React from 'react'
import Link from 'next/link'

export default function QuickActions({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {items.map(i => (
        <Link key={i.href} href={i.href} className="inline-flex items-center gap-3 px-3 py-2 bg-pink-50 rounded hover:bg-pink-100 transition transform hover:-translate-y-0.5">
          <svg className="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 4v16M4 12h16"/></svg>
          <span className="text-sm text-gray-700">{i.label}</span>
        </Link>
      ))}
    </div>
  )
}
