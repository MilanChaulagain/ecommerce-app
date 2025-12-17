"use client";

import React from 'react';
import ProfileForm from './ProfileForm';

export default function CustomerHome({ summary, onProfileSaved }: { summary?: any; onProfileSaved?: () => void }) {
  const user = summary?.user ?? {};
  const name = user.username || user.full_name || 'Customer';
  const email = user.email || '';
  const role = user.role || 'user';

  return (
    <div className="space-y-6">
      <div className="rounded-lg p-4 bg-gradient-to-r from-pink-50 to-pink-100 shadow-md flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center text-white text-xl font-bold">
          {String(name).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-pink-700">{name}</div>
              <div className="text-sm text-pink-600">{email}</div>
            </div>
            <div className="text-sm px-3 py-1 rounded-full bg-white border border-pink-200 text-pink-600 font-semibold">{role}</div>
          </div>
          <div className="text-sm text-pink-500 mt-2">Welcome back — here's your account overview.</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-medium mb-3">Your Profile</h2>
        <ProfileForm onSaved={onProfileSaved} />
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-md font-semibold">Account Settings</h3>
        <p className="text-sm text-gray-500 mt-2">Customers can update their profile values created by admins and manage basic account preferences.</p>
      </div>
    </div>
  );
}
