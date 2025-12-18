"use client";

import React from 'react';
import GroupsManager from './GroupsManager';

export default function AdminHome({ summary }: { summary: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="text-2xl font-bold mt-2">{summary?.stats?.users_count ?? '—'}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">Profile Fields</div>
          <div className="text-2xl font-bold mt-2">{summary?.stats?.fields_count ?? 0}</div>
        </div>
        <div className="p-4 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-500">Profile Completion Avg</div>
          <div className="text-2xl font-bold mt-2">{summary?.stats?.completion_percentage ?? 0}%</div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-3">Groups</h3>
        <GroupsManager />
      </div>
    </div>
  );
}
