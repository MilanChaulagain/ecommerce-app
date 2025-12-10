'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { FormSubmission } from '@/lib/api-client';
import { FormField } from '@/lib/form-builder-types';

interface SubmissionCardProps {
  submission: FormSubmission;
  fields: FormField[];
}

export default function SubmissionCard({ submission, fields }: SubmissionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get display values for the first 2-3 important fields
  const getPreviewFields = () => {
    const previewCount = 3;
    const previewData: Array<{ label: string; value: string }> = [];

    for (let i = 0; i < Math.min(fields.length, previewCount); i++) {
      const field = fields[i];
      const value = submission.data[field.id];
      
      if (value !== undefined && value !== null && value !== '') {
        previewData.push({
          label: field.label,
          value: String(value),
        });
      }
    }

    return previewData;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const previewFields = getPreviewFields();

  return (
    <div className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex-1 min-w-0">
          {/* Preview Info */}
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(submission.submitted_at)}</span>
            </div>
            {submission.submitted_by && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>User #{submission.submitted_by}</span>
              </div>
            )}
          </div>

          {/* Preview Fields */}
          <div className="space-y-0.5">
            {previewFields.map((field, idx) => (
              <p key={idx} className="text-xs text-gray-700 truncate">
                <span className="font-medium">{field.label}:</span>{' '}
                <span className="text-gray-600">{field.value}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        <div className="ml-3 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <h4 className="text-xs font-semibold text-gray-900 mb-3">Complete Submission</h4>
          <div className="space-y-3">
            {fields.map((field) => {
              const value = submission.data[field.id];
              
              // Skip if no value
              if (value === undefined || value === null || value === '') {
                return null;
              }

              return (
                <div key={field.id} className="bg-white p-2 rounded border border-gray-200">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <div className="text-xs text-gray-900">
                    {field.type === 'checkbox' ? (
                      <span className="inline-flex items-center gap-1">
                        <input 
                          type="checkbox" 
                          checked={Boolean(value)} 
                          disabled 
                          className="w-3 h-3"
                        />
                        {Boolean(value) ? 'Checked' : 'Unchecked'}
                      </span>
                    ) : field.type === 'select' || field.type === 'radio' ? (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        {field.options?.find(opt => opt.value === value)?.label || value}
                      </span>
                    ) : field.type === 'textarea' ? (
                      <p className="whitespace-pre-wrap">{String(value)}</p>
                    ) : (
                      <p>{String(value)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Metadata */}
          <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between text-xs text-gray-500">
            <span>Submission ID: #{submission.id}</span>
            <span>IP: {submission.ip_address}</span>
          </div>
        </div>
      )}
    </div>
  );
}
