"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // Profile dropdown state
  const [openProfileId, setOpenProfileId] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<any[] | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

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
            <React.Fragment key={u.id}>
              <tr className="border-t hover:bg-pink-50/30">
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
                  <div className="flex items-center gap-2">
                    <button onClick={async () => {
                      if (openProfileId === u.id) { setOpenProfileId(null); return; }
                      setProfileError(null);
                      setProfileLoading(true);
                      setOpenProfileId(u.id);
                      try {
                        const res = await apiClient.user.viewProfile(u.id);
                        setProfileData(res.data || res);
                      } catch (err: any) {
                        setProfileError(err?.data?.message || err?.message || 'Failed to load profile');
                        setProfileData(null);
                      } finally {
                        setProfileLoading(false);
                      }
                    }} className="text-sm text-indigo-600 hover:underline">View profile</button>

                    <div className="ml-2">
                      {updating === u.id ? <span className="text-xs text-gray-600">Updating…</span> : <span className="text-xs text-gray-600">—</span>}
                    </div>
                  </div>
                </td>
              </tr>

              {openProfileId === u.id && (
                <tr>
                  <td colSpan={5} className="bg-white border-t px-6 py-3">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <strong><p className='text-pink-500'>Profile</p></strong>
                        <button className="text-xs text-gray-500" onClick={() => setOpenProfileId(null)}>Close</button>
                      </div>
                      {profileLoading ? (
                        <div className="text-sm text-gray-500">Loading…</div>
                      ) : profileError ? (
                        <div className="text-sm text-red-600">{profileError}</div>
                      ) : (profileData && profileData.length ? (
                        <ul className="space-y-2 max-h-64 overflow-auto text-sm">
                          {profileData.map((pv: any) => (
                            <li key={pv.id} className="border-b pb-1">
                              <div className="text-gray-700 font-medium">{pv.field_label}</div>
                              <div className="text-gray-600">{pv.value}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-gray-500">No profile data</div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
