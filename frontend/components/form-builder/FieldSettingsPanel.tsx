'use client';

import React from 'react';
import { FormField } from '@/lib/form-builder-types';
import TextFieldSettings from './field-settings/TextFieldSettings';
import NumberFieldSettings from './field-settings/NumberFieldSettings';
import OptionsFieldSettings from './field-settings/OptionsFieldSettings';
import CheckboxFieldSettings from './field-settings/CheckboxFieldSettings';

interface FieldSettingsPanelProps {
  field: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function FieldSettingsPanel({ field, onUpdateField }: FieldSettingsPanelProps) {
  if (!field) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-3">
        <div className="text-center text-gray-500 mt-6">
          <p className="text-xs">No field selected</p>
          <p className="text-[10px] mt-0.5">Click on a field to edit its settings</p>
        </div>
      </div>
    );
  }

  const renderTypeSpecificSettings = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'textarea':
        return <TextFieldSettings field={field} onUpdateField={onUpdateField} />;
      
      case 'number':
        return <NumberFieldSettings field={field} onUpdateField={onUpdateField} />;
      
      case 'select':
      case 'radio':
        return <OptionsFieldSettings field={field} onUpdateField={onUpdateField} />;
      
      case 'checkbox':
        return <CheckboxFieldSettings field={field} onUpdateField={onUpdateField} />;
      
      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 p-3 overflow-y-auto">
      <h3 className="text-xs font-semibold text-gray-900 mb-3">Field Settings</h3>
      
      <div className="space-y-3">
        {/* Common Settings */}
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Field Type</label>
          <input
            type="text"
            value={field.type}
            disabled
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-gray-50"
          />
        </div>

        {field.type !== 'checkbox' && (
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdateField({ label: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
              placeholder="Enter field label"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Field Name</label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => onUpdateField({ name: e.target.value })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
            placeholder="field_name"
          />
        </div>

        {field.type !== 'checkbox' && field.type !== 'radio' && (
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Placeholder</label>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdateField({ placeholder: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            id="required"
            checked={field.required}
            onChange={(e) => onUpdateField({ required: e.target.checked })}
            className="w-3.5 h-3.5"
          />
          <label htmlFor="required" className="text-[12px] font-medium text-gray-700">
            Required Field
          </label>
        </div>

        {/* Type-Specific Settings */}
        {renderTypeSpecificSettings()}
      </div>
    </div>
  );
}
