'use client'

import React from 'react'
import FeaturedProducts from '../FeaturedProducts'

export default function CustomerHomeV2({ user }: { user?: any }) {
  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome{user?.username ? `, ${user.username}` : ''}</h1>
      </header>

      <section className="mt-6">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-semibold">Recommended for you</h2>
          <div className="mt-4">
            {/* Reuse FeaturedProducts component if available */}
            <FeaturedProducts />
          </div>
        </div>
      </section>
    </div>
  )
}
