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
  const [forms, setForms] = useState<FormSchema[]>([]);
  const [targetFormSlug, setTargetFormSlug] = useState<string | null>(null);
  const [targetFields, setTargetFields] = useState<{ id: string; label: string }[]>([]);
  const [selectedSourceField, setSelectedSourceField] = useState<string | null>(null);
  const [selectedTargetField, setSelectedTargetField] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiClient.forms.listForms();
        setForms(list);
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
      return;
    }
    (async () => {
      try {
        const form = await apiClient.forms.getForm(targetFormSlug!);
        const primary = form.language_config?.primary || 'en';
        const fs = form.fields_structure.map(f => ({ id: f.id, label: f.labels?.[primary] || Object.values(f.labels || {})[0] || f.id }));
        setTargetFields(fs);
      } catch (err) {
        console.error('Failed to load target form fields', err);
        setTargetFields([]);
      }
    })();
  }, [targetFormSlug]);

  const handleCreate = () => {
    setValidationError('');
    if (!selectedSourceField) return setValidationError('Please choose a source field');
    if (!targetFormSlug || !selectedTargetField) return setValidationError('Please choose a target table and field');

    const exists = currentRelationships.find(r => r.field_id === selectedSourceField);
    if (exists) {
      // UI will show replace option — don't auto-remove here
      return setValidationError('A relationship already exists for this source field. Use Replace to override.');
    }

    const r: FormRelationship = {
      field_id: selectedSourceField,
      target_form_slug: targetFormSlug,
      display_field: selectedTargetField,
    };
    addRelationship(r);
    setSelectedSourceField(null);
    setSelectedTargetField(null);
    setTargetFormSlug(null);
  };

  const handleReplace = () => {
    if (!selectedSourceField) return setValidationError('Select a source field to replace');
    if (!targetFormSlug || !selectedTargetField) return setValidationError('Select a target table and field');
    removeRelationship(selectedSourceField);
    const r: FormRelationship = {
      field_id: selectedSourceField,
      target_form_slug: targetFormSlug,
      display_field: selectedTargetField,
    };
    addRelationship(r);
    setSelectedSourceField(null);
    setSelectedTargetField(null);
    setTargetFormSlug(null);
    setValidationError('');
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
      {currentRelationships.find(r => r.field_id === id) && (
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
        {/* Source form */}
        <div className="col-span-1 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="text-sm font-semibold text-gray-800 mb-2">This Form — Fields</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {currentFields.map(f => fieldCard(f.label || f.name, f.id, selectedSourceField === f.id, () => setSelectedSourceField(f.id)))}
            {currentFields.length === 0 && <div className="text-xs text-gray-500">No fields</div>}
          </div>
        </div>

        {/* Target forms list */}
        <div className="col-span-1 bg-gray-50 p-3 rounded border border-gray-200">
          <div className="text-sm font-semibold text-gray-800 mb-2">Available Tables</div>
          <div className="space-y-2 max-h-64 overflow-auto">
            {forms.filter(f => f.slug !== currentFormSlug).map(f => (
              <div key={f.slug} className={`p-2 rounded cursor-pointer ${targetFormSlug === f.slug ? 'bg-pink-50 border border-pink-200 shadow-sm' : 'hover:bg-gray-100 border border-transparent'}`} onClick={() => setTargetFormSlug(f.slug)}>
                <div className="font-medium text-gray-900">{f.title}</div>
                <div className="text-[11px] text-gray-600">{f.slug}</div>
              </div>
            ))}
          </div>
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
          {selectedSourceField && currentRelationships.find(r => r.field_id === selectedSourceField) && (
            <button onClick={handleReplace} className="px-3 py-2 bg-yellow-500 text-white rounded shadow">Replace Existing</button>
          )}

          <div className="ml-auto text-sm text-gray-600">Existing: <span className="font-medium text-gray-800">{currentRelationships.length}</span></div>
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
                {currentRelationships.length === 0 && (
                  <div className="p-3 text-xs text-gray-500">No relationships yet</div>
                )}
                {currentRelationships.map(r => {
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
