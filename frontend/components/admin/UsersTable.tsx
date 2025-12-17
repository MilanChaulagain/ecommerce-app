"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.users.listUsers();
      setUsers(res.results || res);
    } catch (e: any) {
      setError(e?.data?.message || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    setUpdating(userId);
    setError(null);
    try {
      await apiClient.users.setRole(userId, role);
      await load();
    } catch (e: any) {
      setError(e?.data?.message || e?.message || 'Failed to set role');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <div>Loading users…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded shadow overflow-auto p-4">
      <table className="min-w-full text-sm">
        <thead className="bg-white border-b">
          <tr>
            <th className="px-6 py-3 text-left text-gray-800">ID</th>
            <th className="px-6 py-3 text-left text-gray-800">Username</th>
            <th className="px-6 py-3 text-left text-gray-800">Email</th>
            <th className="px-6 py-3 text-left text-gray-800">Role</th>
            <th className="px-6 py-3 text-left text-gray-800">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t hover:bg-pink-50/30">
              <td className="px-6 py-4 text-gray-900">{u.id}</td>
              <td className="px-6 py-4 text-gray-900">{u.username}</td>
              <td className="px-6 py-4 text-gray-900">{u.email}</td>
              <td className="px-6 py-4">
                <select
                  defaultValue={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="border rounded px-2 py-1 text-gray-900 bg-white"
                  disabled={updating === u.id}
                >
                  <option value="user">User</option>
                  <option value="employee">Employee</option>
                  <option value="superemployee">SuperEmployee</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-6 py-4">
                {updating === u.id ? <span className="text-xs text-gray-600">Updating…</span> : <span className="text-xs text-gray-600">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
