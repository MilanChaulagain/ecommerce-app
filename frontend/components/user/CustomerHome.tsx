"use client";

import React from 'react';

export default function CustomerHome({ summary, onProfileSaved }: { summary?: any; onProfileSaved?: () => void }) {
  const user = summary?.user ?? {};
  const name = user.username || user.full_name || 'Customer';
  const email = user.email || '';
  const role = user.role || 'user';

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-6 bg-white border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center text-white text-xl font-semibold">
          {String(name).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">{name}</div>
              <div className="text-sm text-gray-500">{email}</div>
            </div>
            <div className="text-sm px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-700 font-semibold">{role}</div>
          </div>
          <div className="text-sm text-gray-600 mt-2">Welcome back — here's your account overview.</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h2 className="text-lg font-medium mb-3">Your Profile</h2>
        <p className="text-sm text-gray-600">Use the "Add details / Create profile to earn" button above to create or update your profile.</p>
      </div>

      <div className="bg-white p-6 rounded shadow-sm border border-gray-100">
        <h3 className="text-md font-semibold">Account Settings</h3>
        <p className="text-sm text-gray-500 mt-2">Customers can update their profile values created by admins and manage basic account preferences.</p>
      </div>
    </div>
  );
}
