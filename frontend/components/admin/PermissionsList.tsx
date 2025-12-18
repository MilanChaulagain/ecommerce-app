'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/api-client';

export default function PermissionsList({ onEdit }: { onEdit?: (id: number) => void }) {
  const [perms, setPerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.user.listPagePermissions();
      setPerms(data || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this permission?')) return;
    try {
      await apiClient.user.deletePagePermission(id);
      await load();
    } catch (e: any) {
      alert('Failed to delete: ' + (e?.message || 'error'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Page Permissions</h2>
        <button
          onClick={() => onEdit && onEdit(0)}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
        >
          New
        </button>
      </div>

      {loading && <div className="text-gray-300">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="space-y-2">
          {perms.length === 0 && <div className="text-sm text-gray-400">No permissions configured</div>}
          {perms.map((p) => (
            <div key={p.id} className="p-3 bg-gray-800 border border-gray-700 rounded flex items-center justify-between text-gray-100">
              <div>
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-xs text-gray-400">{p.path} {p.prefix ? '(prefix)' : '(exact)'}</div>
                <div className="text-xs text-gray-300">Roles: {(p.allowed_roles || []).join(', ')}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit && onEdit(p.id)} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
