'use client';

import React from 'react';
import { X } from 'lucide-react';
import { FormField } from '@/lib/form-builder-types';

interface FormPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formName: string;
  formDescription: string;
  fields: FormField[];
}

export default function FormPreviewModal({ 
  isOpen, 
  onClose, 
  formName, 
  formDescription, 
  fields 
}: FormPreviewModalProps) {
  if (!isOpen) return null;

  const renderField = (field: FormField) => {
    const baseClasses = "w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500";

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className={baseClasses}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            defaultValue={field.defaultValue}
            rows={3}
          />
        );
      
      case 'select':
        return (
          <select 
            className={baseClasses} 
            required={field.required}
            multiple={field.allowMultiple}
          >
            {field.placeholder && <option value="">{field.placeholder}</option>}
            {field.options?.map((opt, idx) => (
              <option key={idx} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              defaultChecked={field.defaultChecked}
            />
            <span className="text-xs text-gray-700">{field.label}</span>
          </div>
        );
      
      case 'radio':
        return (
          <div className="space-y-1.5">
            {field.options?.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.name}
                  value={opt.value}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={field.required && idx === 0}
                />
                <span className="text-xs text-gray-700">{opt.label}</span>
              </div>
            ))}
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            className={baseClasses}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            defaultValue={field.defaultValue}
          />
        );
      
      default:
        return (
          <input
            type={field.type}
            className={baseClasses}
            placeholder={field.placeholder}
            required={field.required}
            minLength={field.minLength}
            maxLength={field.maxLength}
            defaultValue={field.defaultValue}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Form Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4 cursor-pointer hover:text-red-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-1">{formName || 'Untitled Form'}</h3>
              {formDescription && (
                <p className="text-xs text-gray-600">{formDescription}</p>
              )}
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="form-group">
                  {field.type !== 'checkbox' && (
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  )}
                  {renderField(field)}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Form
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full cursor-pointer px-4 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
