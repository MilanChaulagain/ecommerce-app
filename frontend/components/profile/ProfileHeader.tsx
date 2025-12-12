import React from 'react';

export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-center bg-gradient-to-br from-pink-400 to-pink-300 rounded-2xl p-6 mb-4">
      <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center mb-3">
        <span className="text-4xl">🪁</span>
      </div>
      <div className="text-white text-xl font-bold">Guest User</div>
      <div className="text-white text-sm mb-3">guest@heramba.com</div>
      <button className="flex items-center gap-2 bg-white text-pink-500 font-semibold px-6 py-2 rounded-full shadow hover:bg-pink-50 transition mb-2">
        <span className="text-lg">⇥</span> Login / Sign Up
      </button>
    </div>
  );
}
