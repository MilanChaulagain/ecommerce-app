'use client';

import { useEffect, useMemo, useState } from 'react';
import apiClient from '@/lib/api-client';
import { FormField, FormRelationship, FormSchema } from '@/lib/form-builder-types';

interface RelationsDesignerProps {
  currentFormSlug: string | null;
  currentFields: FormField[];
  currentRelationships: FormRelationship[];
  addRelationship: (r: FormRelationship) => void;
  removeRelationship: (fieldId: string) => void;
}

export default function RelationsDesigner({
  currentFormSlug,
  currentFields,
  currentRelationships,
  addRelationship,
  removeRelationship,
}: RelationsDesignerProps) {
  // Debug log incoming relationships prop
  useEffect(() => {
    console.debug('RelationsDesigner: currentRelationships prop', currentRelationships);
  }, [currentRelationships]);
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [sourceFormSlug, setSourceFormSlug] = useState<string | null>(null);
  const [sourceFields, setSourceFields] = useState<{ id: string; label: string }[]>([]);
  const [sourceFormRelationships, setSourceFormRelationships] = useState<FormRelationship[]>([]);
  const [targetFormSlug, setTargetFormSlug] = useState<string | null>(null);
  const [targetFields, setTargetFields] = useState<{ id: string; label: string }[]>([]);
  const [targetFormRelationships, setTargetFormRelationships] = useState<FormRelationship[]>([]);
  const [selectedSourceField, setSelectedSourceField] = useState<string | null>(null);
  const [selectedTargetField, setSelectedTargetField] = useState<string | null>(null);
  const [persistTo, setPersistTo] = useState<'current' | 'source' | 'target'>('current');

  // Determine which relationships to display: prefer selected source form, then target form, otherwise the current form's relationships
  const displayedRelationships = useMemo(() => {
    if (sourceFormSlug && sourceFormRelationships && sourceFormRelationships.length) return sourceFormRelationships;
    if (targetFormSlug && targetFormRelationships && targetFormRelationships.length) return targetFormRelationships;
    return currentRelationships || [];
  }, [sourceFormSlug, targetFormSlug, sourceFormRelationships, targetFormRelationships, currentRelationships]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiClient.forms.listForms();
        setForms(list);
        // default source = current form when available
        if (list && list.length && currentFormSlug) setSourceFormSlug(currentFormSlug);
      } catch (err) {
        console.error('Failed to load forms for relations', err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!targetFormSlug) {
      setTargetFields([]);
      setSelectedTargetField(null);
      setTargetFormRelationships([]);
      return;
    }
    (async () => {
      try {
        const form = await apiClient.forms.getForm(targetFormSlug!);
        const primary = form.language_config?.primary || 'en';
        const fs = form.fields_structure.map(f => ({ id: f.id, label: f.labels?.[primary] || Object.values(f.labels || {})[0] || f.id }));
        setTargetFields(fs);
        setTargetFormRelationships(Array.isArray(form.relationships) ? form.relationships : []);
      } catch (err) {
        console.error('Failed to load target form fields', err);
        setTargetFields([]);
      }
    })();
  }, [targetFormSlug]);

  useEffect(() => {
    if (!sourceFormSlug) {
      setSourceFields([]);
      setSelectedSourceField(null);
      setSourceFormRelationships([]);
      return;
    }
    (async () => {
      try {
        // If the selected source is the current form, use currentFields prop when present
        if (sourceFormSlug === currentFormSlug && currentFields && currentFields.length) {
          const fs = currentFields.map(f => ({ id: f.id, label: f.label || f.name }));
          setSourceFields(fs);
          return;
        }

        const form = await apiClient.forms.getForm(sourceFormSlug!);
        const primary = form.language_config?.primary || 'en';
        const fs = form.fields_structure.map(f => ({ id: f.id, label: f.labels?.[primary] || Object.values(f.labels || {})[0] || f.id }));
        setSourceFields(fs);
        setSourceFormRelationships(Array.isArray(form.relationships) ? form.relationships : []);
      } catch (err) {
        console.error('Failed to load source form fields', err);
        setSourceFields([]);
      }
    })();
  }, [sourceFormSlug, currentFormSlug, currentFields]);

  // Ensure the form payload used for PUT matches backend expectations.
  // - ensure language_config.primary exists
  // - ensure fields_structure is an array and each field has id, type, labels (labels is an object)
  const sanitizeFormForUpdate = (form: any) => {
    const language_config = (form && form.language_config && typeof form.language_config === 'object') ? { ...form.language_config } : {};
    if (!language_config.primary) language_config.primary = 'en';

    const rawFields = Array.isArray(form?.fields_structure) ? form.fields_structure : [];
    const fields_structure = rawFields.map((f: any) => {
      const id = f?.id || f?.field_id || f?.name || f?.key || '';
      const type = f?.type || 'text';
      let labels = f?.labels;
      if (!labels || typeof labels !== 'object') {
        // try to derive a label
        const derived = f?.label || f?.name || id;
        labels = { [language_config.primary]: derived };
      }
      return { id: String(id), type, labels };
    });

    const relationships = Array.isArray(form?.relationships) ? form.relationships : [];

    return {
      title: form?.title || '',
      description: form?.description || '',
      language_config,
      fields_structure,
      relationships,
      slug: form?.slug,
      created_by: form?.created_by,
    };
  };

  const handleCreate = () => {
    setValidationError('');
    if (!selectedSourceField) return setValidationError('Please choose a source field');
    if (!sourceFormSlug) return setValidationError('Please choose a source table');
    if (!targetFormSlug || !selectedTargetField) return setValidationError('Please choose a target table and field');

    // Build relationship payload
    const r: FormRelationship = {
      field_id: selectedSourceField,
      target_form_slug: targetFormSlug,
      display_field: selectedTargetField,
    };

    const persistSlug = persistTo === 'current' ? currentFormSlug : (persistTo === 'source' ? sourceFormSlug : targetFormSlug);
    if (!persistSlug) return setValidationError('Invalid persist target');

    // If persisting to current form (editor), add into local state
    if (persistSlug === currentFormSlug) {
      const exists = currentRelationships.find(r0 => r0.field_id === selectedSourceField);
      if (exists) return setValidationError('A relationship already exists for this source field on the current form. Use Replace to override.');
      addRelationship(r);
      setSelectedSourceField(null);
      setSelectedTargetField(null);
      setTargetFormSlug(null);
      setSourceFormSlug(currentFormSlug);
      return;
    }

    // Persist to another form immediately via API (source or target)
    (async () => {
      try {
        const formToUpdate = await apiClient.forms.getForm(persistSlug!);
        const existing = formToUpdate.relationships || [];
        // Prevent duplicate
        if (existing.find((er: any) => er.field_id === selectedSourceField && er.target_form_slug === targetFormSlug && er.display_field === selectedTargetField)) {
          return setValidationError('That relationship already exists on the selected form.');
        }

        const updatedRelationships = [...existing, r];

        const sanitized = sanitizeFormForUpdate(formToUpdate);
        const payload = { ...sanitized, relationships: updatedRelationships };

        await apiClient.forms.updateForm(formToUpdate.slug, payload);
        const newList = await apiClient.forms.listForms();
        setForms(newList);
        setValidationError('');
        alert('Relationship saved to ' + persistSlug);

        setSelectedSourceField(null);
        setSelectedTargetField(null);
        setTargetFormSlug(null);
        setSourceFormSlug(currentFormSlug);
      } catch (err: any) {
        console.error('Failed to persist relationship to other form', err);
        setValidationError(err?.message || 'Failed to persist relationship');
      }
    })();
  };

  const handleReplace = () => {
    if (!selectedSourceField) return setValidationError('Select a source field to replace');
    if (!targetFormSlug || !selectedTargetField) return setValidationError('Select a target table and field');

    const r: FormRelationship = {
      field_id: selectedSourceField,
      target_form_slug: targetFormSlug,
      display_field: selectedTargetField,
    };

    const persistSlug = persistTo === 'current' ? currentFormSlug : (persistTo === 'source' ? sourceFormSlug : targetFormSlug);
    if (!persistSlug) return setValidationError('Invalid persist target');

    // Replace locally on current form
    if (persistSlug === currentFormSlug) {
      removeRelationship(selectedSourceField);
      addRelationship(r);
      setSelectedSourceField(null);
      setSelectedTargetField(null);
      setTargetFormSlug(null);
      setValidationError('');
      return;
    }

    // Replace on remote form via API
    (async () => {
      try {
        const formToUpdate = await apiClient.forms.getForm(persistSlug!);
        const existing = formToUpdate.relationships || [];

        // Remove any existing relation with same source field
        const filtered = existing.filter((er: any) => er.field_id !== selectedSourceField);
        const updatedRelationships = [...filtered, r];

        const sanitized = sanitizeFormForUpdate(formToUpdate);
        const payload = { ...sanitized, relationships: updatedRelationships };

        await apiClient.forms.updateForm(formToUpdate.slug, payload);
        const newList = await apiClient.forms.listForms();
        setForms(newList);
        setSelectedSourceField(null);
        setSelectedTargetField(null);
        setTargetFormSlug(null);
        setValidationError('');
        alert('Relationship updated on ' + persistSlug);
      } catch (err: any) {
        console.error('Failed to replace relationship on remote form', err);
        setValidationError(err?.message || 'Failed to replace relationship');
      }
    })();
  };

  const [validationError, setValidationError] = useState<string>('');

  const fieldCard = (label: string, id: string, selected: boolean, onClick?: () => void) => (
    <div
      onClick={onClick}
      key={id}
      className={`p-2 rounded border cursor-pointer text-sm flex justify-between items-center ${selected ? 'bg-pink-50 border-pink-300' : 'bg-white border-gray-200 hover:shadow-sm'}`}>
      <div>
        <div className="font-medium text-gray-800 truncate">{label}</div>
        <div className="text-[11px] text-gray-500 truncate">{id}</div>
      </div>
      {displayedRelationships.find(r => r.field_id === id) && (
        <div className="ml-3 text-[11px] px-2 py-0.5 bg-pink-100 text-pink-800 rounded-full">Linked</div>
      )}
    </div>
  );

  return (
    <div className="w-full mt-6 bg-white p-5 rounded-lg shadow border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Relationships Designer</h3>
        <div className="text-sm text-gray-600">Like MS Access: pick a source field, then a target table field</div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Source form selection + fields */}
        <div className="col-span-1 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-800">Source — Table & Fields</div>
            <div className="text-xs text-gray-500">Select source table</div>
          </div>

          <div className="mb-2">
            <div className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">Choose source table</label>
              <select value={sourceFormSlug ?? ''} onChange={(e) => setSourceFormSlug(e.target.value || null)} className="w-full text-sm text-pink-400 border rounded px-2 py-1">
                <option value="">-- Select table --</option>
                {currentFormSlug && <option value={currentFormSlug}>Current Form ({currentFormSlug})</option>}
                {forms.map(f => (
                  <option key={f.slug} value={f.slug}>{f.title} — {f.slug}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 max-h-24 overflow-auto">
              {forms.map(f => (
                <div key={f.slug} onClick={() => setSourceFormSlug(f.slug)} className={`p-2 rounded cursor-pointer ${sourceFormSlug === f.slug ? 'bg-pink-50 border border-pink-200 shadow-sm' : 'hover:bg-gray-100 border border-transparent'}`}>
                  <div className="font-medium text-gray-900">{f.title}</div>
                  <div className="text-[11px] text-gray-600">{f.slug}</div>
                </div>
              ))}
              {forms.length === 0 && <div className="text-xs text-gray-500">No forms available</div>}
            </div>
          </div>

          <div className="text-sm font-semibold text-gray-800 mb-2">Fields</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {sourceFields.map(sf => fieldCard(sf.label, sf.id, selectedSourceField === sf.id, () => setSelectedSourceField(sf.id)))}
            {sourceFields.length === 0 && <div className="text-xs text-gray-500">Choose a source table to view fields</div>}
          </div>
        </div>

        {/* Target forms list */}
        <div className="col-span-1 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="text-sm font-semibold text-gray-800 mb-2">Available Tables</div>
          <div className="mb-2">
            <label className="block text-xs text-gray-600 mb-1">Choose target table</label>
            <select value={targetFormSlug ?? ''} onChange={(e) => setTargetFormSlug(e.target.value || null)} className="w-full text-black text-sm border rounded px-2 py-1">
              <option value="">-- Select table --</option>
              {forms.filter(f => f.slug !== currentFormSlug).map(f => (
                <option className= "text-black" key={f.slug} value={f.slug}>{f.title} — {f.slug}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {forms.filter(f => f.slug !== currentFormSlug).map(f => (
              <div key={f.slug} className={`p-2 rounded cursor-pointer ${targetFormSlug === f.slug ? 'bg-pink-50 border border-pink-200 shadow-sm' : 'hover:bg-gray-100 border border-transparent'}`} onClick={() => setTargetFormSlug(f.slug)}>
                <div className="font-medium text-gray-900">{f.title}</div>
                <div className="text-[11px] text-gray-600">{f.slug}</div>
              </div>
            ))}
          </div>
          {targetFormSlug && targetFormRelationships.length > 0 && (
            <div className="mt-2 text-xs text-gray-700">
              <div className="font-medium text-sm">Target form relationships</div>
              <div className="text-[11px] text-gray-500">{targetFormRelationships.length} relationship(s)</div>
              <div className="mt-1 space-y-1">
                {targetFormRelationships.map(rel => {
                  const tgt = forms.find(f => f.slug === rel.target_form_slug);
                  return (
                    <div key={rel.field_id} className="text-[11px] text-gray-600">{rel.field_id} → {tgt?.title || rel.target_form_slug} ({rel.display_field})</div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Target fields */}
        <div className="col-span-1 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-800">Target Fields</div>
            <div className="text-xs text-gray-600">Selected: {selectedTargetField || 'none'}</div>
          </div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {targetFields.map(tf => fieldCard(tf.label, tf.id, selectedTargetField === tf.id, () => setSelectedTargetField(tf.id)))}
            {!targetFields.length && <div className="text-xs text-gray-500">Choose a target table</div>}
          </div>
        </div>
      </div>

      {/* validation and actions */}
      <div className="mt-4">
        {validationError && <div className="text-sm text-rose-600 mb-2">{validationError}</div>}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-black">Persist to:</label>
            <select 
          
            value={persistTo} onChange={(e) => setPersistTo(e.target.value as any)} className="text-xs text-pink-900 border rounded px-2 py-1">
              <option value="current">Current Form</option>
              <option value="source">Source Form</option>
              <option value="target">Target Form</option>
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!selectedSourceField || !targetFormSlug || !selectedTargetField}
            className={`px-4 py-2 rounded text-white shadow-sm ${(!selectedSourceField || !targetFormSlug || !selectedTargetField) ? 'bg-pink-200 cursor-not-allowed text-pink-700' : 'bg-pink-600 hover:bg-pink-700'}`}>
            Create Relationship
          </button>

          <button
            onClick={() => { setSelectedSourceField(null); setSelectedTargetField(null); setTargetFormSlug(null); setValidationError(''); }}
            className="px-3 py-2 border rounded text-sm text-red-500">
            Reset
          </button>

          {/* Replace button shown when a relationship exists for the selected source */}
          {selectedSourceField && displayedRelationships.find(r => r.field_id === selectedSourceField) && (
            <button onClick={handleReplace} className="px-3 py-2 bg-yellow-500 text-white rounded shadow">Replace Existing</button>
          )}

          <div className="ml-auto text-sm text-gray-600">Existing: <span className="font-medium text-gray-800">{displayedRelationships.length}</span></div>
        </div>

        {/* Existing relationships list */}
        <div className="mt-3 bg-gray-50 border border-gray-100 p-3 rounded">
          <div className="text-sm font-semibold text-gray-800 mb-3">Existing Relationships</div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 pb-2 border-b border-gray-100">
                <div className="col-span-4 font-medium">Source Field</div>
                <div className="col-span-4 font-medium">Target Table</div>
                <div className="col-span-3 font-medium">Target Field</div>
                <div className="col-span-1 font-medium">Actions</div>
              </div>
              <div className="divide-y divide-gray-100">
                {displayedRelationships.length === 0 && (
                  <div className="p-3 text-xs text-gray-500">No relationships yet</div>
                )}
                {displayedRelationships.map(r => {
                  const srcField = currentFields.find(f => f.id === r.field_id);
                  const srcLabel = srcField?.label || r.field_id;
                  const targetForm = forms.find(f => f.slug === r.target_form_slug);
                  const primary = targetForm?.language_config?.primary || 'en';
                  const targetField = targetForm?.fields_structure?.find((fs: any) => fs.id === r.display_field);
                  const targetLabel = targetField?.labels?.[primary] || Object.values(targetField?.labels || {})[0] || r.display_field;

                  return (
                    <div key={r.field_id} className="grid grid-cols-12 gap-2 items-center p-3 bg-white rounded-md shadow-sm">
                      <div className="col-span-4">
                        <div className="font-medium text-sm text-gray-900">{srcLabel}</div>
                        <div className="text-[11px] text-gray-600">{r.field_id}</div>
                      </div>

                      <div className="col-span-4">
                        <div className="font-medium text-sm text-gray-900">{targetForm?.title || r.target_form_slug}</div>
                        <div className="text-[11px] text-gray-600">{targetForm?.slug}</div>
                      </div>

                      <div className="col-span-3">
                        <div className="text-sm text-gray-900">{targetLabel}</div>
                        <div className="text-[11px] text-gray-600">{r.display_field}</div>
                      </div>

                      <div className="col-span-1 flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedSourceField(r.field_id); setTargetFormSlug(r.target_form_slug); setSelectedTargetField(r.display_field); }} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50 text-black">Edit</button>
                        <button onClick={() => { if (confirm('Remove relationship?')) removeRelationship(r.field_id); }} className="px-2 py-1 text-xs border rounded text-rose-600 hover:bg-rose-50">Remove</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
