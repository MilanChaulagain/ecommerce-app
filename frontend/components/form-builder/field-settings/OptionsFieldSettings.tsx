'use client';

import React from 'react';
import { Plus, X } from 'lucide-react';
import { FormField, FieldOption } from '@/lib/form-builder-types';

interface OptionsFieldSettingsProps {
  field: FormField;
  onUpdateField: (updates: Partial<FormField>) => void;
}

export default function OptionsFieldSettings({ field, onUpdateField }: OptionsFieldSettingsProps) {
  const addOption = () => {
    const optionNumber = (field.options?.length || 0) + 1;
    const newOption: FieldOption = {
      value: `option_${optionNumber}`,
      label: `Option ${optionNumber}`
    };
    onUpdateField({ options: [...(field.options || []), newOption] });
  };

  const removeOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdateField({ options: newOptions });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = field.options?.map((opt, i) => 
      i === index ? { ...opt, ...updates } : opt
    ) || [];
    onUpdateField({ options: newOptions });
  };

  return (
    <>
      {(field.type === 'select' || field.type === 'radio') && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allowMultiple"
            checked={field.allowMultiple || false}
            onChange={(e) => onUpdateField({ allowMultiple: e.target.checked })}
            className="w-4 h-4"
          />
          <label htmlFor="allowMultiple" className="text-xs font-medium text-gray-700">
            Allow Multiple Selection
          </label>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-medium text-gray-700">
            Options ({field.options?.length || 0})
          </label>
          <button
            type="button"
            onClick={addOption}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Option
          </button>
        </div>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {field.options?.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-xs border border-dashed border-gray-300 rounded">
              No options yet. Click Add Option to create one.
            </div>
          ) : (
            field.options?.map((option, index) => (
              <div key={index} className="flex gap-1.5 items-center bg-gray-50 p-1.5 rounded border border-gray-200">
                <span className="text-[10px] font-medium text-gray-500 w-4">{index + 1}.</span>
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateOption(index, { 
                    label: e.target.value,
                    value: e.target.value.toLowerCase().replace(/\s+/g, '_')
                  })}
                  className="flex-1 px-1.5 py-1 border border-gray-300 rounded text-[11px] text-gray-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={field.options?.length === 1}
                  className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  title={field.options?.length === 1 ? "At least one option is required" : "Remove option"}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
        
        <button
          type="button"
          onClick={addOption}
          className="w-full mt-1.5 py-1.5 border border-dashed border-gray-300 rounded text-[10px] text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add Another
        </button>
        
        {field.options && field.options.length > 5 && (
          <p className="text-[10px] text-gray-500 mt-1 text-center">
            {field.options.length} options
          </p>
        )}
      </div>
    </>
  );
}
