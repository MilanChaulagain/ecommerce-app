"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function GroupMembersManager({ group, onDone }: { group: any; onDone?: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | ''>('');
  const [role, setRole] = useState('member');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.groups.listMembers(group.id);
      setMembers(res.results || res);
    } catch (e: any) {
      setError(e?.message || 'Failed to load members');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [group]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!userId) return setError('Enter user id');
    try {
      await apiClient.groups.addMember(group.id, Number(userId), role);
      setUserId(''); load(); if (onDone) onDone();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to add');
    }
  }

  async function handleRemove(uId: number) {
    try {
      await apiClient.groups.removeMember(group.id, uId);
      load(); if (onDone) onDone();
    } catch (err) {
      setError('Failed to remove');
    }
  }

  async function handleSetRole(uId: number, newRole: string) {
    try {
      await apiClient.users.setRole(uId, newRole);
      load(); if (onDone) onDone();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to set role');
    }
  }

  return (
    <div className="p-3 border rounded bg-gray-50">
      <h4 className="font-semibold">Manage Members — {group.name}</h4>
      <form onSubmit={handleAdd} className="flex gap-2 my-2">
        <input placeholder="User ID" value={userId as any} onChange={(e) => setUserId(e.target.value === '' ? '' : Number(e.target.value))} className="border p-2 rounded" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 rounded">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
        </select>
        <button className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      <div className="space-y-2 mt-2">
        {loading && <div>Loading...</div>}
        {!loading && members.length === 0 && <div className="text-sm text-gray-500">No members</div>}
        {members.map(m => (
          <div key={m.id} className="flex justify-between items-center border rounded p-2 bg-white">
            <div>
              <div className="font-medium">{m.user_email || m.user?.email || 'User'}</div>
              <div className="text-xs text-gray-500">Role: {m.role}</div>
            </div>
            <div>
              <select defaultValue={m.role} onChange={(e) => handleSetRole(m.user_id || m.user?.id, e.target.value)} className="mr-2 border p-1 rounded">
                <option value="user">User</option>
                <option value="employee">Employee</option>
                <option value="superemployee">SuperEmployee</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={() => handleRemove(m.user_id || m.user?.id)} className="text-sm text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
