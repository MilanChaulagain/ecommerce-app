'use client';

import React from 'react';
import { FormField } from '@/lib/form-builder-types';

interface MediaFieldSettingsProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function MediaFieldSettings({ field, onUpdateField }: MediaFieldSettingsProps) {
  return (
    <>
      <div>
        <label className="block text-[10px] font-medium text-gray-700 mb-0.5">
          Accepted File Types
        </label>
        <input
          type="text"
          value={field.accept || (field.type === 'image' ? 'image/*' : 'video/*')}
          onChange={e => onUpdateField({ accept: e.target.value })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
          placeholder={field.type === 'image' ? 'image/*, .jpg, .png' : 'video/*, .mp4'}
        />
        <p className="text-[10px] text-gray-400 mt-0.5">
          Example: {field.type === 'image' ? 'image/*, .jpg, .png' : 'video/*, .mp4'}
        </p>
      </div>
      <div>
        <label className="block text-[10px] font-medium text-gray-700 mb-0.5">
          Max File Size (MB)
        </label>
        <input
          type="number"
          min={1}
          max={100}
          value={field.maxSizeMB || 5}
          onChange={e => onUpdateField({ maxSizeMB: parseInt(e.target.value) || 1 })}
          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900"
        />
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        <input
          type="checkbox"
          id="allowMultiple"
          checked={field.allowMultiple || false}
          onChange={e => onUpdateField({ allowMultiple: e.target.checked })}
          className="w-3.5 h-3.5"
        />
        <label htmlFor="allowMultiple" className="text-[12px] font-medium text-gray-700">
          Allow Multiple Files
        </label>
      </div>
    </>
  );
}
