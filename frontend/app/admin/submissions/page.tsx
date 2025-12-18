"use client";

import React from 'react';
import SubmissionsTable from '@/components/admin/SubmissionsTable';

export default function AdminSubmissionsPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-pink-700">Form Submissions</h1>
        <div className="text-sm text-gray-600">Admins can inspect submitted data here.</div>
      </div>

      <div>
        <SubmissionsTable />
      </div>
    </div>
  );
}
