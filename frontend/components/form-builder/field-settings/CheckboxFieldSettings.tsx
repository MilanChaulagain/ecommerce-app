'use client';

import React from 'react';
import { FormField } from '@/lib/form-builder-types';

interface CheckboxFieldSettingsProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function CheckboxFieldSettings({ field, onUpdateField }: CheckboxFieldSettingsProps) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="checkbox"
        id="defaultChecked"
        checked={field.defaultChecked || false}
        onChange={(e) => onUpdateField({ defaultChecked: e.target.checked })}
        className="w-3.5 h-3.5"
      />
      <label htmlFor="defaultChecked" className="text-[10px] font-medium text-gray-700">
        Checked by Default
      </label>
    </div>
  );
}
