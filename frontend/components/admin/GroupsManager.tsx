"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function GroupsManager() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [membersMap, setMembersMap] = useState<Record<string, any[]>>({});
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [addingMember, setAddingMember] = useState<Record<string, boolean>>({});
  const [selectedUser, setSelectedUser] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.groups.listGroups();
      setGroups(Array.isArray(res) ? res : (res.results ?? []));
    } catch (err) {
      console.error(err);
      const e = err as any;
      setError(e?.data?.detail || e?.message || JSON.stringify(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) { setError('Name required'); return; }
    setCreating(true); setError(null);
    try {
      await apiClient.groups.createGroup({ name: name.trim(), description: description.trim() });
      setName(''); setDescription('');
      load();
    } catch (err) {
      console.error(err);
      const e = err as any;
      setError(e?.data?.detail || e?.message || JSON.stringify(e));
    } finally { setCreating(false); }
  };

  const toggleExpand = async (g: any) => {
    const key = String(g.id ?? g.pk ?? g.name);
    setExpanded(s => ({ ...s, [key]: !s[key] }));
    if (!membersMap[key] && !membersMap[key + '_loading']) {
      try {
        const members = await apiClient.groups.listMembers(g.id ?? g.pk ?? g.name);
        setMembersMap(m => ({ ...m, [key]: members }));
      } catch (err) {
        console.error('Failed to load members', err);
        const e = err as any;
        setError(e?.data?.detail || e?.message || JSON.stringify(e));
        setMembersMap(m => ({ ...m, [key]: [] }));
      }
    }
  };

  const loadUsers = async () => {
    if (allUsers.length) return;
    try {
      const u = await apiClient.users.listUsers();
      setAllUsers(Array.isArray(u) ? u : (u.results ?? []));
    } catch (err) {
      console.error('Failed to load users', err);
      const e = err as any;
      setError(e?.data?.detail || e?.message || JSON.stringify(e));
    }
  };

  const handleAddMember = async (group: any) => {
    const key = String(group.id ?? group.pk ?? group.name);
    const userId = selectedUser[key];
    if (!userId) return;
    setAddingMember(s => ({ ...s, [key]: true }));
    try {
      await apiClient.groups.addMember(group.id ?? group.pk ?? group.name, Number(userId));
      // refresh members list
      const members = await apiClient.groups.listMembers(group.id ?? group.pk ?? group.name);
      setMembersMap(m => ({ ...m, [key]: members }));
      setSelectedUser(s => ({ ...s, [key]: '' }));
    } catch (err) {
      console.error(err);
      const e = err as any;
      setError(e?.data?.detail || e?.message || JSON.stringify(e));
    } finally {
      setAddingMember(s => ({ ...s, [key]: false }));
    }
  };

  const handleRemoveMember = async (group: any, userId: number) => {
    try {
      await apiClient.groups.removeMember(group.id ?? group.pk ?? group.name, userId);
      const key = String(group.id ?? group.pk ?? group.name);
      const members = await apiClient.groups.listMembers(group.id ?? group.pk ?? group.name);
      setMembersMap(m => ({ ...m, [key]: members }));
    } catch (err) {
      console.error(err);
      const e = err as any;
      setError(e?.data?.detail || e?.message || JSON.stringify(e));
    }
  };

  return (
    <div className="space-y-4 max-w-4xl text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-2">Groups</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create and manage user groups. Admins can add or remove members.</p>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Group name" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <div className="flex items-center gap-2">
            <button type="submit" disabled={creating} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded">{creating ? 'Creating…' : 'Create Group'}</button>
            <button type="button" onClick={() => { setName(''); setDescription(''); setError(null); }} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">Reset</button>
          </div>
        </form>

        {/* Auth Debugging Tools */}
        <div className="mb-4 p-2 rounded border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-gray-700 dark:text-gray-200 font-medium">Auth Debug</div>
            <button onClick={async () => {
              setDebugInfo('Checking...');
              try {
                const access = localStorage.getItem('access_token');
                const admin = localStorage.getItem('admin_token');
                const refresh = localStorage.getItem('refresh_token');
                const token = access ?? admin ?? '';
                setDebugInfo(`access: ${access ? 'present' : 'missing'} | admin: ${admin ? 'present' : 'missing'} | refresh: ${refresh ? 'present' : 'missing'}`);
                // quick call to roles with raw fetch to show raw response
                const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const r = await fetch(`${base}/api/user/roles/`, { headers: { 'Authorization': `Bearer ${token}` } });
                const text = await r.text();
                setDebugInfo(`HTTP ${r.status} ${r.statusText}\n${text}`);
              } catch (err: any) {
                setDebugInfo(`Error: ${err?.message || String(err)}`);
              }
            }} className="px-2 py-1 text-xs border rounded text-gray-700 dark:text-gray-200">Check tokens / roles endpoint</button>
          </div>
          {debugInfo && <pre className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>}
        </div>

        {error && <div className="text-red-600 mb-2">{error}</div>}

        {loading ? (
          <div className="text-gray-500 dark:text-gray-400">Loading groups…</div>
        ) : (
          <div className="space-y-3">
            {groups.map((g) => {
              const key = String(g.id ?? g.pk ?? g.name);
              const members = membersMap[key] ?? [];
              return (
                <div key={key} className="border rounded p-3 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{g.name ?? g.title ?? g.slug}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{g.description ?? ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { toggleExpand(g); loadUsers(); }} className="text-sm text-indigo-600 hover:underline">{expanded[key] ? 'Hide' : 'Members'}</button>
                      <button onClick={() => { /* could open edit */ }} className="text-sm text-gray-600 dark:text-gray-300">Edit</button>
                    </div>
                  </div>

                  {expanded[key] && (
                    <div className="mt-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                      <div className="space-y-2">
                        {Array.isArray(members) && members.length > 0 ? members.map((m: any) => (
                          <div key={m.id ?? m.pk} className="flex items-center justify-between p-2 border rounded border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">{m.username ?? m.name ?? m.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{m.email ?? ''}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleRemoveMember(g, m.id ?? m.pk)} className="text-sm text-red-600">Remove</button>
                            </div>
                          </div>
                        )) : <div className="text-sm text-gray-500 dark:text-gray-400">No members</div>}

                        <div className="mt-2 flex items-center gap-2">
                          <select value={selectedUser[key] ?? ''} onChange={(e) => setSelectedUser(s => ({ ...s, [key]: e.target.value }))} className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded p-2">
                            <option value="">Select user to add</option>
                            {allUsers.map((u) => <option key={u.id ?? u.pk} value={u.id ?? u.pk}>{u.username ?? u.email}</option>)}
                          </select>
                          <button onClick={() => handleAddMember(g)} disabled={addingMember[key]} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded">{addingMember[key] ? 'Adding…' : 'Add Member'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
