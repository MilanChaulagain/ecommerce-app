'use client';

import Link from 'next/link';
import { ShieldCheck, Settings as SettingsIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded flex items-center justify-center text-white">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl text-pink-500 font-semibold">Settings</h1>
          <p className="text-sm text-gray-500">Manage global application settings and permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/admin/settings/permissions" className="block p-4 bg-white border rounded hover:shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="font-medium text-pink-500">Permissions</div>
              <div className="text-xs text-gray-500">Control page access for roles and specific users.</div>
            </div>
          </div>
        </Link>

        {/* Placeholder for other settings sections */}
        <div className="p-4 bg-white border rounded">
          <div className="font-medium text-pink-500">Other Settings</div>
          <div className="text-xs text-gray-500">Site-wide configuration and feature toggles.</div>
        </div>
      </div>
    </div>
  );
}
