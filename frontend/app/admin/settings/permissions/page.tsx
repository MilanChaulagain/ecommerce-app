'use client';

import React, { useState } from 'react';
import PermissionsList from '../../../../components/admin/PermissionsList';
import PermissionForm from '../../../../components/admin/PermissionForm';

export default function PermissionsPage() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5">
          <PermissionsList onEdit={(id) => setEditingId(id || 0)} key={refreshKey} />
        </div>
        <div className="col-span-7">
          <div className="sticky top-20">
            <PermissionForm
              id={editingId ?? 0}
              onSaved={() => { setEditingId(null); setRefreshKey(k => k+1); }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
