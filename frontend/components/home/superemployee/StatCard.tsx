'use client'

import React from 'react'

export default function StatCard({ label, value, children }: { label: string; value: number | string; children?: React.ReactNode }) {
  return (
    <div className="p-5 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">{label}</div>
          <div className="text-3xl font-bold mt-2 tracking-tight">{value}</div>
        </div>
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-50 to-indigo-50 rounded-lg text-pink-600">
          {children}
        </div>
      </div>
    </div>
  )
}
