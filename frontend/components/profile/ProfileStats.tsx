import React from 'react';

const stats = [
  { label: 'Orders', value: 3 },
  { label: 'Wishlist', value: 3 },
  { label: 'Points', value: 250, highlight: true },
];

export default function ProfileStats() {
  return (
    <div className="flex justify-between mb-4">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col items-center bg-white rounded-xl px-4 py-2 shadow text-center min-w-[80px]">
          <span className={`text-lg font-bold ${stat.highlight ? 'text-pink-500' : 'text-gray-800'}`}>{stat.value}</span>
          <span className="text-xs text-gray-500">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}
