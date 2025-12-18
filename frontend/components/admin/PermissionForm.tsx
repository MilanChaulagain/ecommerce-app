'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/api-client';

export default function PermissionForm({ id, onSaved, onCancel }: { id?: number; onSaved?: () => void; onCancel?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [prefix, setPrefix] = useState(true);
  const [allowedRoles, setAllowedRoles] = useState<string>('');
  const [allowedUsers, setAllowedUsers] = useState<string>('');
  const [active, setActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || id === 0) return;
    (async () => {
      setLoading(true);
      try {
        const p = await apiClient.user.getPagePermission(id!);
        setName(p.name || '');
        setPath(p.path || '');
        setPrefix(Boolean(p.prefix));
        setAllowedRoles((p.allowed_roles || []).join(', '));
        setAllowedUsers((p.allowed_users || []).join(', '));
        setActive(Boolean(p.active));
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally { setLoading(false); }
    })();
  }, [id]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        path: path.trim(),
        prefix,
        allowed_roles: allowedRoles.split(',').map(r => r.trim()).filter(Boolean),
        allowed_users: allowedUsers.split(',').map(s => Number(s)).filter(Boolean),
        active,
      };
      if (!id || id === 0) {
        await apiClient.user.createPagePermission(payload);
      } else {
        await apiClient.user.updatePagePermission(id, payload);
      }
      onSaved && onSaved();
    } catch (err: any) {
      setError(err?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 bg-gray-900 border border-gray-800 rounded text-gray-100">
      <h3 className="font-semibold mb-2 text-white">{id && id !== 0 ? 'Edit' : 'New'} Permission</h3>
      {error && <div className="text-red-400 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-300">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded px-2 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Path</label>
          <input value={path} onChange={(e) => setPath(e.target.value)} className="w-full rounded px-2 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400" placeholder="/admin/dashboard" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={prefix} onChange={(e) => setPrefix(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
          <label className="text-sm text-gray-300">Prefix match</label>
        </div>
        <div>
          <label className="block text-sm text-gray-300">Allowed roles (comma separated)</label>
          <input value={allowedRoles} onChange={(e) => setAllowedRoles(e.target.value)} className="w-full rounded px-2 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400" placeholder="admin, superemployee" />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Allowed users (IDs comma separated)</label>
          <input value={allowedUsers} onChange={(e) => setAllowedUsers(e.target.value)} className="w-full rounded px-2 py-2 bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-400" placeholder="1,2,3" />
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-indigo-500 w-4 h-4" />
          <label className="text-sm text-gray-300">Active</label>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded">Save</button>
          <button type="button" onClick={() => onCancel && onCancel()} className="px-3 py-1 bg-gray-800 border border-gray-700 text-gray-200 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}
