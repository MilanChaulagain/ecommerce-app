"use client";

import React, { useState } from 'react';
import apiClient from '@/lib/api-client';

export default function ProfileFieldCreator({ onCreated }: { onCreated?: (created: any) => void }) {
  const [label, setLabel] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState('text');
  const [optionsText, setOptionsText] = useState('');
  const [required, setRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!label.trim()) {
      setError('Label is required');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        label: label.trim(),
        type,
        required,
      };
      if (slug.trim()) payload.id = slug.trim();
      if (type === 'dropdown' || type === 'select' || type === 'radio') {
        payload.options = optionsText.split(',').map(s => s.trim()).filter(Boolean);
      }
      const res = await apiClient.user.createProfileField(payload);
      setSuccess('Field created');
      setLabel(''); setSlug(''); setOptionsText(''); setRequired(false); setType('text');
      onCreated && onCreated(res);
      setTimeout(() => setSuccess(null), 2500);
    } catch (err: any) {
      console.error(err);
      setError(err?.data?.message || err?.message || 'Failed to create field');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded bg-white shadow-sm">
      <h3 className="text-sm font-semibold mb-2 text-indigo-700">Add a custom profile field</h3>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="col-span-1 md:col-span-1">
          <label className="text-xs block mb-1">Label (display)</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="text-xs block mb-1">Field key (optional)</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. favorite_color" className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" />
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="text-xs block mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200">
            <option value="text">Text</option>
            <option value="textarea">Textarea</option>
            <option value="number">Number</option>
            <option value="dropdown">Dropdown</option>
            <option value="radio">Radio</option>
            <option value="checkbox">Checkbox</option>
            <option value="file">File</option>
          </select>
        </div>

        {(type === 'dropdown' || type === 'radio') && (
          <div className="col-span-1 md:col-span-3">
            <label className="text-xs block mb-1">Options (comma separated)</label>
            <input value={optionsText} onChange={(e) => setOptionsText(e.target.value)} className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="red, green, blue" />
          </div>
        )}

        <div className="col-span-1 md:col-span-1 flex items-center gap-2">
          <input id="required-field" type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
          <label htmlFor="required-field" className="text-sm">Required</label>
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-2 justify-end">
          <button type="submit" disabled={loading} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition">
            {loading ? 'Creating…' : 'Create Field'}
          </button>
        </div>
      </form>
    </div>
  );
}
