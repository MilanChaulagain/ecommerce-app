'use client';

import React from 'react';
import { FormField } from '@/lib/form-builder-types';

interface TextFieldSettingsProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function TextFieldSettings({ field, onUpdateField }: TextFieldSettingsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Min Length</label>
          <input
            type="number"
            min="0"
            max="500"
            value={field.minLength || 0}
            onChange={(e) => onUpdateField({ minLength: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Max Length</label>
          <input
            type="number"
            min="0"
            max="500"
            value={field.maxLength || 0}
            onChange={(e) => onUpdateField({ maxLength: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Default Value</label>
        <input
          type="text"
          value={field.defaultValue || ''}
          onChange={(e) => onUpdateField({ defaultValue: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          placeholder="Enter default value"
        />
      </div>
    </>
  );
}
