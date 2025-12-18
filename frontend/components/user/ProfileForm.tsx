"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import ProfileFieldCreator from './ProfileFieldCreator';

type FieldDef = {
  id: string;
  type: string;
  labels?: { [k: string]: string };
  required?: boolean;
  options?: string[];
  existing_value?: any;
};

export default function ProfileForm({ onSaved }: { onSaved?: () => void }) {
  const [fields, setFields] = useState<FieldDef[] | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFields = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.user.getProfileForm();
      let f: any[] = res.fields ?? res.fields_structure ?? [];
      f = f.map((it) => ({ ...it, type: it.type ?? it.field_type }));
      setFields(f);
      const initial: Record<string, any> = {};
      f.forEach((fld) => {
        initial[fld.id] = (fld.type === 'file') ? null : (fld.existing_value ?? '');
      });
      setValues(initial);
    } catch (err) {
      console.error('Failed to load profile form', err);
      setError('Failed to load profile fields');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, v: any) => {
    setValues((s) => ({ ...s, [id]: v }));
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    if (!fields) return;
    for (const f of fields) {
      if (f.required && (values[f.id] === undefined || values[f.id] === '')) {
        setError(`${f.labels?.['en'] ?? f.id} is required`);
        return;
      }
    }

    setSaving(true);
    try {
      const hasFile = Object.values(values).some(v => (typeof File !== 'undefined' && v instanceof File));
      if (hasFile) {
        const fd = new FormData();
        const dataItems: any[] = [];
        for (const field of fields) {
          const val = values[field.id];
          if (val instanceof File) {
            dataItems.push({ field: Number(field.id), value: '' });
            fd.append(`file_${field.id}`, val);
          } else {
            dataItems.push({ field: Number(field.id), value: val ?? '' });
          }
        }
        fd.append('data', JSON.stringify(dataItems));
        await apiClient.user.saveProfile(fd);
      } else {
        await apiClient.user.saveProfile({ values });
      }

      setSuccess('Profile saved');
      onSaved && onSaved();
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      console.error('Save failed', e);
      setError(e?.data?.message || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading profile fields…</div>;
  if (error && !fields) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <ProfileFieldCreator onCreated={() => loadFields()} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields && fields.map((f) => (
          <div key={f.id} className="flex flex-col">
            <label className="text-sm font-medium text-indigo-700 mb-1">{(f as any).label ?? f.labels?.['en'] ?? f.id}{f.required ? ' *' : ''}</label>
            {f.type === 'textarea' ? (
              <textarea value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border text-blue-500 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            ) : f.type === 'dropdown' || f.type === 'select' ? (
              <select value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200">
                <option value="">Select</option>
                {(f.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
                <input type="checkbox" checked={!!values[f.id]} onChange={(e) => handleChange(f.id, e.target.checked)} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500" />
              ) : f.type === 'file' ? (
                <input type="file" onChange={(e) => handleChange(f.id, e.target.files?.[0] ?? null)} className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            ) : (
              <input value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-200" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        <button onClick={() => { setValues(fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.type === 'file' ? null : (f.existing_value ?? '') }), {} as Record<string, any>) ?? {}); setError(null); }} className="px-3 py-2 border rounded hover:bg-gray-50 transition">
          Reset
        </button>
      </div>
    </div>
  );
}
