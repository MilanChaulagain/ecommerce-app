'use client';

import { useState, FormEvent } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { FormSchema } from '@/lib/api-client';
import { fromBackendFieldStructure } from '@/lib/form-builder-types';
import apiClient from '@/lib/api-client';

interface FormPreviewTabProps {
  form: FormSchema;
  onSubmitSuccess?: () => void;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function FormPreviewTab({ form, onSubmitSuccess }: FormPreviewTabProps) {
  const [formData, setFormData] = useState<Record<string, string | number | boolean | File | File[] | undefined>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const baseClasses = "w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const errorClasses = "w-full px-2 py-1.5 border border-red-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-red-50";

  const handleInputChange = (fieldId: string, value: string | number | boolean | File | File[] | undefined) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // Remove a file from a multiple file field
  const handleRemoveFile = (fieldId: string, index: number) => {
    setFormData(prev => {
      const files = prev[fieldId];
      if (Array.isArray(files)) {
        const newFiles = files.slice();
        newFiles.splice(index, 1);
        return { ...prev, [fieldId]: newFiles };
      }
      return prev;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    form.fields_structure.forEach(backendField => {
      const field = fromBackendFieldStructure(backendField, form.language_config.primary);
      const value = formData[field.id];

      if (field.required) {
        if (value === undefined || value === null || value === '') {
          newErrors[field.id] = `${field.label} is required`;
        }
      }

      if (value) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            newErrors[field.id] = 'Please enter a valid email address';
          }
        }

        if (field.type === 'url') {
          try {
            new URL(String(value));
          } catch {
            newErrors[field.id] = 'Please enter a valid URL';
          }
        }

        if (field.type === 'tel') {
          const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
          if (!phoneRegex.test(String(value))) {
            newErrors[field.id] = 'Please enter a valid phone number';
          }
        }

        if (field.type === 'number') {
          const numValue = Number(value);
          if (field.min !== undefined && numValue < field.min) {
            newErrors[field.id] = `Minimum value is ${field.min}`;
          }
          if (field.max !== undefined && numValue > field.max) {
            newErrors[field.id] = `Maximum value is ${field.max}`;
          }
        }

        if (field.type === 'text' || field.type === 'textarea') {
          const strValue = String(value);
          if (field.minLength !== undefined && strValue.length < field.minLength) {
            newErrors[field.id] = `Minimum length is ${field.minLength} characters`;
          }
          if (field.maxLength !== undefined && strValue.length > field.maxLength) {
            newErrors[field.id] = `Maximum length is ${field.maxLength} characters`;
          }
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Please fix the errors above');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      // Build FormData for file and non-file fields
      const fd = new FormData();
      fd.append('slug', form.slug);
      // Collect non-file data
      const data: Record<string, any> = {};
      for (const backendField of form.fields_structure) {
        const field = fromBackendFieldStructure(backendField, form.language_config.primary);
        const value = formData[field.id];
        if (field.type === 'image' || field.type === 'video') {
          // Append files to FormData, but also include a placeholder in the JSON data
          // so backend validators that inspect `data` see the field key present.
          if (field.allowMultiple && Array.isArray(value)) {
            value.forEach((file: File, idx: number) => {
              fd.append(`file__${field.id}_${idx}`, file);
            });
            // store filenames array (or empty array) so backend sees the key
            data[field.id] = Array.isArray(value) ? value.map((f: File) => f.name) : [];
          } else if (value instanceof File) {
            fd.append(`file__${field.id}`, value);
            data[field.id] = value.name;
          } else {
            // No file selected: set empty string so required check will still fail client-side
            data[field.id] = '';
          }
        } else {
          data[field.id] = value;
        }
      }
      fd.append('data', JSON.stringify(data));

      await apiClient.submissions.submitForm(fd);

      setStatus('success');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      setTimeout(() => {
        setFormData({});
        setErrors({});
        setStatus('idle');
      }, 2000);

    } catch (error) {
      setStatus('error');
      
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Failed to submit form. Please try again.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }

      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Success Message */}
      {status === 'success' && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-xs text-green-700 font-medium">Form submitted successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-xs text-red-700 font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Form Fields */}
      <div className="space-y-3">
        {form.fields_structure.map((backendField) => {
          const field = fromBackendFieldStructure(backendField, form.language_config.primary);
          const hasError = !!errors[field.id];
          const fieldClasses = hasError ? errorClasses : baseClasses;
          return (
            <div key={field.id} className="form-group">
              {field.type !== 'checkbox' && (
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
              )}
              {field.type === 'image' ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    accept={field.accept || 'image/*'}
                    className={fieldClasses}
                    required={field.required}
                    multiple={field.allowMultiple}
                    onChange={e => {
                      const files = e.target.files;
                      if (field.allowMultiple) {
                        handleInputChange(field.id, files ? Array.from(files) : []);
                      } else {
                        const file = files && files[0] ? files[0] : undefined;
                        handleInputChange(field.id, file);
                      }
                    }}
                  />
                  {/* Preview for multiple or single */}
                  {field.allowMultiple && Array.isArray(formData[field.id]) && (formData[field.id] as File[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData[field.id] as File[]).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${idx+1}`}
                            className="max-h-24 rounded border border-gray-200 object-contain"
                          />
                          <button type="button" onClick={() => handleRemoveFile(field.id, idx)} className="absolute top-0 right-0 bg-white/80 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!field.allowMultiple && formData[field.id] instanceof File && (
                    <img
                      src={URL.createObjectURL(formData[field.id] as File)}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded border border-gray-200 object-contain"
                    />
                  )}
                </div>
              ) : field.type === 'video' ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="file"
                    accept={field.accept || 'video/*'}
                    className={fieldClasses}
                    required={field.required}
                    multiple={field.allowMultiple}
                    onChange={e => {
                      const files = e.target.files;
                      if (field.allowMultiple) {
                        handleInputChange(field.id, files ? Array.from(files) : []);
                      } else {
                        const file = files && files[0] ? files[0] : undefined;
                        handleInputChange(field.id, file);
                      }
                    }}
                  />
                  {/* Preview for multiple or single */}
                  {field.allowMultiple && Array.isArray(formData[field.id]) && (formData[field.id] as File[]).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(formData[field.id] as File[]).map((file, idx) => (
                        <div key={idx} className="relative group">
                          <video
                            src={URL.createObjectURL(file)}
                            controls
                            className="max-h-32 rounded border border-gray-200 object-contain"
                          />
                          <button type="button" onClick={() => handleRemoveFile(field.id, idx)} className="absolute top-0 right-0 bg-white/80 text-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!field.allowMultiple && formData[field.id] instanceof File && (
                    <video
                      src={URL.createObjectURL(formData[field.id] as File)}
                      controls
                      className="mt-2 max-h-40 rounded border border-gray-200 object-contain"
                    />
                  )}
                </div>
              ) : field.type === 'textarea' ? (
                <textarea
                  className={fieldClasses}
                  placeholder={field.placeholder}
                  value={String(formData[field.id] || '')}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  rows={3}
                />
              ) : field.type === 'select' ? (
                <select 
                  className={fieldClasses} 
                  value={String(formData[field.id] || '')}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                >
                  {field.placeholder && <option value="">{field.placeholder}</option>}
                  {field.options?.map((opt, idx) => (
                    <option key={idx} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={Boolean(formData[field.id])}
                    onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  />
                  <label className="text-xs text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                </div>
              ) : field.type === 'radio' ? (
                <div className="space-y-1.5">
                  {field.options?.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={formData[field.id] === opt.value}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        className="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                        required={field.required && idx === 0}
                      />
                      <span className="text-xs text-gray-700">{opt.label}</span>
                    </div>
                  ))}
                </div>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  className={fieldClasses}
                  placeholder={field.placeholder}
                  value={formData[field.id] !== undefined ? Number(formData[field.id]) : ''}
                  onChange={(e) => handleInputChange(field.id, parseFloat(e.target.value))}
                  required={field.required}
                  min={field.min}
                  max={field.max}
                />
              ) : (
                <input
                  type={field.type}
                  className={fieldClasses}
                  placeholder={field.placeholder}
                  value={String(formData[field.id] || '')}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                />
              )}
              {hasError && (
                <p className="mt-1 text-xs text-red-600">{errors[field.id]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'success'}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Submitted
            </>
          ) : (
            'Submit Form'
          )}
        </button>
      </div>
    </form>
  );
}
