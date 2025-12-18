"use client";

import GroupsManager from '@/components/admin/GroupsManager';

export default function AdminGroupsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Groups Manager</h1>
      <GroupsManager />
    </div>
  );
}
