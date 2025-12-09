'use client';

import React from 'react';
import { FormField } from '@/lib/form-builder-types';

interface NumberFieldSettingsProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function NumberFieldSettings({ field, onUpdateField }: NumberFieldSettingsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Min Value</label>
          <input
            type="number"
            value={field.min ?? ''}
            onChange={(e) => onUpdateField({ min: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
            placeholder="No minimum"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Max Value</label>
          <input
            type="number"
            value={field.max ?? ''}
            onChange={(e) => onUpdateField({ max: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
            placeholder="No maximum"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Default Value</label>
        <input
          type="number"
          value={field.defaultValue || ''}
          onChange={(e) => onUpdateField({ defaultValue: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          placeholder="Enter default value"
        />
      </div>
    </>
  );
}
