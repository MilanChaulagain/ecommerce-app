"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

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
    let mounted = true;
    setLoading(true);
    apiClient.user.getProfileForm()
      .then((res) => {
        if (!mounted) return;
        const f: FieldDef[] = res.fields ?? res.fields_structure ?? [];
        setFields(f);
        const initial: Record<string, any> = {};
        f.forEach((fld) => {
          initial[fld.id] = fld.existing_value ?? '';
        });
        setValues(initial);
      })
      .catch((err) => {
        console.error('Failed to load profile form', err);
        setError('Failed to load profile fields');
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

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
      await apiClient.user.saveProfile({ values });
      setSuccess('Profile saved');
      onSaved && onSaved();
      setTimeout(() => setSuccess(null), 2500);
    } catch (e: any) {
      console.error('Save failed', e);
      setError(e?.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading profile fields…</div>;
  if (error && !fields) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-4">
      {error && <div className="text-red-600">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields && fields.map((f) => (
          <div key={f.id} className="flex flex-col">
            <label className="text-sm font-medium text-pink-700 mb-1">{f.labels?.['en'] ?? f.id}{f.required ? ' *' : ''}</label>
            {f.type === 'textarea' ? (
              <textarea value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border rounded p-2" />
            ) : f.type === 'dropdown' || f.type === 'select' ? (
              <select value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border rounded p-2">
                <option value="">Select</option>
                {(f.options ?? []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            ) : f.type === 'checkbox' ? (
              <input type="checkbox" checked={!!values[f.id]} onChange={(e) => handleChange(f.id, e.target.checked)} />
            ) : (
              <input value={values[f.id] ?? ''} onChange={(e) => handleChange(f.id, e.target.value)} className="border rounded p-2" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-pink-500 text-white rounded shadow">
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        <button onClick={() => { setValues(fields?.reduce((acc, f) => ({ ...acc, [f.id]: f.existing_value ?? '' }), {} as Record<string, any>) ?? {}); setError(null); }} className="px-3 py-2 border rounded">
          Reset
        </button>
      </div>
    </div>
  );
}
