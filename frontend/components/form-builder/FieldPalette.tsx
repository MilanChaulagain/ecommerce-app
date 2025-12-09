'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { FIELD_TYPES } from '@/lib/field-types';
import { FieldType } from '@/lib/form-builder-types';

interface FieldPaletteProps {
  onAddField: (type: FieldType) => void;
}

export default function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <div className="w-52 bg-white border-r border-gray-200 p-3">
      <h3 className="text-xs font-semibold text-gray-900 mb-2">Field Types</h3>
      <div className="space-y-1.5">
        {FIELD_TYPES.map((fieldType) => {
          const IconComponent = fieldType.icon;
          return (
            <button
              key={fieldType.type}
              onClick={() => onAddField(fieldType.type)}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded border border-gray-200 hover:border-blue-300 transition-all"
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span className="flex-1 text-left">{fieldType.label}</span>
              <Plus className="w-3 h-3 opacity-50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
