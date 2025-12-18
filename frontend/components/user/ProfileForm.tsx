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
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);

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
      // also try to fetch current user avatar for preview
      try {
        const home = await apiClient.user.getHome();
        const avatar = home?.user?.avatar || home?.user?.avatar_url || null;
        if (avatar) setProfilePicPreview(avatar);
      } catch {
        // ignore
      }
      const initial: Record<string, any> = {};
      f.forEach((fld) => {
        initial[fld.id] = (fld.type === 'file') ? null : (fld.existing_value ?? '');
      });
      setValues(initial);
    } catch (err: any) {
      console.error('Failed to load profile form', err);
      const code = err?.status || err?.statusCode || err?.data?.status || (err?.data?.detail && err?.data?.detail.status);
      if (code === 401) {
        setAuthRequired(true);
        setError('Not authenticated — please log in');
      } else {
        setError('Failed to load profile fields');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, v: any) => {
    setValues((s) => ({ ...s, [id]: v }));
  };

  const handleProfilePic = (file: File | null) => {
    setProfilePicFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setProfilePicPreview(url);
    } else {
      setProfilePicPreview(null);
    }
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
      const hasFile = !!profilePicFile || Object.values(values).some(v => (typeof File !== 'undefined' && v instanceof File));
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
        if (profilePicFile) {
          fd.append('profile_picture', profilePicFile);
        }
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
    <div className="relative space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 rounded-lg shadow-lg" aria-busy={saving}>
      {saving && (
        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center z-50">
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-white font-medium">Saving…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-700 text-red-50 px-3 py-2 rounded">
          <div className="flex items-center justify-between">
            <div>{error}</div>
            {authRequired && (
              <button onClick={() => { if (typeof window !== 'undefined') window.location.href = '/admin/login'; }} className="ml-3 px-3 py-1 bg-white text-indigo-700 rounded text-sm">Log in</button>
            )}
          </div>
        </div>
      )}
      {success && <div className="bg-emerald-700 text-emerald-50 px-3 py-2 rounded">{success}</div>}

      <ProfileFieldCreator onCreated={() => loadFields()} />

      {/* Profile picture uploader */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
          {profilePicPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profilePicPreview} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-300">No image</div>
          )}
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-200 block mb-1">Profile picture</label>
          <input type="file" accept="image/*" onChange={(e) => handleProfilePic(e.target.files?.[0] ?? null)} className="text-sm text-gray-200" />
          {profilePicFile && <div className="text-xs text-gray-300 mt-1">Selected: {profilePicFile.name}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">        {fields && fields.map((f) => (
          <div key={f.id} className="flex flex-col">
            <label className="text-sm font-medium text-gray-200 mb-1">{(f as any).label ?? f.labels?.['en'] ?? f.id}{f.required ? ' *' : ''}</label>
            {f.type === 'textarea' ? (
              <textarea value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ) : f.type === 'dropdown' || f.type === 'select' ? (
              <select value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select</option>
                {(f.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
                <input type="checkbox" checked={!!values[f.id]} onChange={(e) => handleChange(f.id, e.target.checked)} className="h-4 w-4 text-indigo-400 focus:ring-indigo-300" />
              ) : f.type === 'file' ? (
                <input type="file" onChange={(e) => handleChange(f.id, e.target.files?.[0] ?? null)} className="border border-gray-700 bg-gray-800 text-gray-100 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            ) : (
              <input value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border border-gray-700 bg-gray-800 text-gray-100 placeholder-gray-400 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        <button onClick={() => { setValues(fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.type === 'file' ? null : (f.existing_value ?? '') }), {} as Record<string, any>) ?? {}); setError(null); handleProfilePic(null); }} className="px-3 py-2 border border-gray-700 rounded hover:bg-gray-700 text-gray-200 transition">
          Reset
        </button>
      </div>
    </div>
  );
}
