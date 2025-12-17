"use client";

import React from 'react';
import UsersTable from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-pink-700">User Management</h1>
        <div className="text-sm text-gray-600">Superusers can manage roles here.</div>
      </div>

      <div className="mb-4">
        <UsersTable />
      </div>
    </div>
  );
}
