import React from 'react';

const menu = [
  {
    icon: '📦',
    title: 'My Orders',
    desc: 'Track and manage orders',
  },
  {
    icon: '🏅',
    title: 'Rewards & Points',
    desc: 'Earn and redeem points',
  },
  {
    icon: '💖',
    title: 'Wishlist',
    desc: 'Your favorite items',
  },
  {
    icon: '📍',
    title: 'Addresses',
    desc: 'Manage delivery addresses',
  },
  {
    icon: '⚙️',
    title: 'Settings',
    desc: 'App preferences',
  },
  {
    icon: '🆘',
    title: 'Help & Support',
    desc: 'Get assistance',
  },
];

export default function ProfileMenu() {
  return (
    <div className="flex flex-col gap-3">
      {menu.map((item) => (
        <button
          key={item.title}
          className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 shadow hover:bg-pink-50 transition text-left"
        >
          <span className="text-2xl bg-pink-100 rounded-lg p-2">{item.icon}</span>
          <div className="flex-1">
            <div className="font-semibold text-gray-800 text-sm">{item.title}</div>
            <div className="text-xs text-gray-500">{item.desc}</div>
          </div>
          <span className="text-gray-400 text-lg">›</span>
        </button>
      ))}
    </div>
  );
}
