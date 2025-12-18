"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import GroupMembersManager from './GroupMembersManager';

export default function GroupsManager() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiClient.groups.listGroups();
      setGroups(res.results || res);
    } catch (e: any) {
      setError(e?.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiClient.groups.createGroup({ name, description: desc });
      setName(''); setDesc('');
      load();
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Failed to create');
    }
  }

  return (
    <div>
      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="Group name" value={name} onChange={e => setName(e.target.value)} />
        <button className="bg-blue-600 text-white px-3 py-2 rounded">Create</button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="space-y-2">
        {loading && <div>Loading…</div>}
        {!loading && groups.length === 0 && <div className="text-sm text-gray-500">No groups yet.</div>}
        {groups.map(g => (
          <div key={g.id} className="p-3 border rounded flex justify-between items-center bg-white">
            <div>
              <div className="font-medium">{g.name}</div>
              <div className="text-xs text-gray-500">{g.description}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(g)} className="px-2 py-1 border rounded">Manage</button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="mt-4">
          <button onClick={() => setSelected(null)} className="text-sm text-blue-600 mb-2">Close</button>
          <GroupMembersManager group={selected} onDone={load} />
        </div>
      )}
    </div>
  );
}
