"use client";

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function SubmissionsTable() {
  const [forms, setForms] = useState<any[]>([]);
  const [loadingForms, setLoadingForms] = useState<boolean>(true);
  const [formsError, setFormsError] = useState<string | null>(null);

  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const [submissionsMap, setSubmissionsMap] = useState<Record<string, any[]>>({});
  const [loadingSubmissions, setLoadingSubmissions] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => { loadForms(); }, []);

  async function loadForms() {
    setLoadingForms(true);
    setFormsError(null);
    try {
      const res = await apiClient.forms.listForms();
      setForms(res || []);
    } catch (e: any) {
      setFormsError(e?.data?.message || e?.message || 'Failed to load forms');
    } finally {
      setLoadingForms(false);
    }
  }

  async function toggleForm(slug: string) {
    if (expandedSlug === slug) {
      setExpandedSlug(null);
      return;
    }

    if (submissionsMap[slug]) {
      setExpandedSlug(slug);
      return;
    }

    setLoadingSubmissions(slug);
    try {
      const subs = await apiClient.forms.getFormSubmissions(slug);
      setSubmissionsMap(prev => ({ ...prev, [slug]: subs || [] }));
      setExpandedSlug(slug);
    } catch (err) {
      console.error('Failed to load submissions for', slug, err);
      setFormsError('Failed to load submissions');
    } finally {
      setLoadingSubmissions(null);
    }
  }

  if (loadingForms) return <div>Loading forms…</div>;
  if (formsError) return <div className="text-red-600">{formsError}</div>;

  return (
    <div className="bg-white rounded shadow overflow-auto p-4">
      <table className="min-w-full text-sm">
        <thead className="bg-white border-b">
          <tr>
            <th className="px-6 py-3 text-left text-gray-800">Form</th>
            <th className="px-6 py-3 text-left text-gray-800">Slug</th>
            <th className="px-6 py-3 text-left text-gray-800">Submissions</th>
            <th className="px-6 py-3 text-right text-gray-800">&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {forms.map((f: any) => (
            <React.Fragment key={f.id}>
              <tr className="border-t hover:bg-pink-50/30">
                <td className="px-6 py-4 text-gray-900">{f.title}</td>
                <td className="px-6 py-4 text-gray-700">{f.slug}</td>
                <td className="px-6 py-4 text-gray-900">{f.submission_count ?? 0}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleForm(f.slug)} className="px-3 py-1 bg-pink-600 text-white rounded text-sm flex items-center gap-2 ml-auto">
                    {expandedSlug === f.slug ? 'Collapse' : 'View'}
                    <svg className={`w-4 h-4 transform ${expandedSlug === f.slug ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                </td>
              </tr>

              {expandedSlug === f.slug && (
                <tr>
                  <td colSpan={4} className="bg-gray-50 p-4">
                    {loadingSubmissions === f.slug ? (
                      <div>Loading submissions…</div>
                    ) : (
                      <div>
                        <h4 className="text-sm font-medium text-gray-800 mb-2">Submissions for {f.title}</h4>
                        <div className="overflow-auto border rounded bg-white">
                          <table className="min-w-full text-sm">
                            <thead className="bg-white border-b">
                              <tr>
                                <th className="px-4 py-2 text-left text-gray-800">ID</th>
                                <th className="px-4 py-2 text-left text-gray-800">Submitted By</th>
                                <th className="px-4 py-2 text-left text-gray-800">Submitted At</th>
                                <th className="px-4 py-2 text-left text-gray-800">Preview</th>
                                <th className="px-4 py-2 text-right text-gray-800">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(submissionsMap[f.slug] || []).map((s: any) => (
                                <tr key={s.id} className="border-t hover:bg-pink-50/30">
                                  <td className="px-4 py-3 text-gray-900">{s.id}</td>
                                  <td className="px-4 py-3 text-gray-900">{s.submitted_by ?? 'Anonymous'}</td>
                                  <td className="px-4 py-3 text-gray-900">{new Date(s.submitted_at).toLocaleString()}</td>
                                  <td className="px-4 py-3 text-gray-900">{typeof s.data === 'object' ? JSON.stringify(s.data).slice(0, 80) : String(s.data).slice(0, 80)}</td>
                                  <td className="px-4 py-3 text-right">
                                    <button onClick={() => setSelected({ ...s, form_title: f.title })} className="px-2 py-1 bg-pink-600 text-white rounded text-sm">View</button>
                                  </td>
                                </tr>
                              ))}
                              {(!(submissionsMap[f.slug] || []).length) && (
                                <tr><td colSpan={5} className="p-4 text-sm text-gray-600">No submissions yet.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="mt-4 p-4 bg-gray-50 border rounded">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Submission #{selected.id} — {selected.form_title}</h3>
            <div>
              <button onClick={() => { setSelected(null); }} className="text-sm text-gray-700">Close</button>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm text-gray-800 font-medium">Submitted By</div>
            <div className="text-sm text-gray-700 mb-2">{selected.submitted_by ?? 'Anonymous'}</div>

            <div className="text-sm text-gray-800 font-medium">Submitted At</div>
            <div className="text-sm text-gray-700 mb-2">{new Date(selected.submitted_at).toLocaleString()}</div>

            <div className="text-sm text-gray-800 font-medium">Data</div>
            <div className="mt-2 grid gap-2">
              {selected.data && typeof selected.data === 'object' ? (
                Object.entries(selected.data).map(([k, v]) => (
                  <div key={k} className="p-2 bg-white border rounded">
                    <div className="text-xs text-gray-600 font-medium">{k}</div>
                    <div className="mt-1 text-sm text-gray-800">
                      {renderFieldValue(v, selected)}
                    </div>
                  </div>
                ))
              ) : (
                <pre className="mt-2 p-3 bg-white border rounded text-xs text-gray-800 overflow-auto">{String(selected.data)}</pre>
              )}
            </div>

            {selected.files && selected.files.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-gray-800 font-medium">Files</div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {selected.files.map((f: any) => {
                    const url = f.file || f.file_url || f.file?.url || f.file;
                    return (
                      <div key={f.id} className="bg-white border rounded p-2">
                        {isImage(url) ? (
                          <img src={url} alt={f.id} className="w-full h-36 object-cover rounded" />
                        ) : isVideo(url) ? (
                          <video src={url} controls className="w-full h-36 object-cover rounded" />
                        ) : (
                          <a href={url} target="_blank" rel="noreferrer" className="text-sm text-pink-700">Download</a>
                        )}
                        <div className="mt-2 text-xs text-gray-600">{new Date(f.uploaded_at || f.uploadedAt || f.uploaded_at).toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  function isImage(url: any) {
    if (!url || typeof url !== 'string') return false;
    return !!url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?.*)?$/i);
  }

  function isVideo(url: any) {
    if (!url || typeof url !== 'string') return false;
    return !!url.match(/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i);
  }

  function renderFieldValue(value: any, submission: any) {
    if (value === null || value === undefined) return <span className="text-gray-500">—</span>;
    if (typeof value === 'string') {
      if (isImage(value)) return <img src={value} alt="image" className="w-full max-h-40 object-cover rounded" />;
      if (isVideo(value)) return <video src={value} controls className="w-full max-h-40 object-cover rounded" />;
      if (value.length > 200) return <pre className="text-xs overflow-auto">{value}</pre>;
      return <span>{value}</span>;
    }
    if (Array.isArray(value) || typeof value === 'object') return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
    return <span>{String(value)}</span>;
  }
}
