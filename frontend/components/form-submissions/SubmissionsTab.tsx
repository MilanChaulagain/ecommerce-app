'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { FormSchema, FormSubmission } from '@/lib/api-client';
import { fromBackendFieldStructure, FormField } from '@/lib/form-builder-types';
import SubmissionCard from './SubmissionCard';
import apiClient from '@/lib/api-client';

interface SubmissionsTabProps {
  form: FormSchema;
  refreshTrigger?: number;
}

type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function SubmissionsTab({ form, refreshTrigger = 0 }: SubmissionsTabProps) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [fields, setFields] = useState<FormField[]>([]);

  useEffect(() => {
    // Convert backend fields to frontend format once
    const frontendFields = form.fields_structure.map(backendField =>
      fromBackendFieldStructure(backendField, form.language_config.primary)
    );
    setFields(frontendFields);
  }, [form]);

  const fetchSubmissions = async () => {
    setLoadingState('loading');
    setErrorMessage('');

    try {
      const data = await apiClient.forms.getFormSubmissions(form.slug);
      setSubmissions(data);
      setLoadingState('success');
    } catch (error) {
      setLoadingState('error');
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Failed to load submissions');
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.slug, refreshTrigger]);

  // Loading State
  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-gray-600">Loading submissions...</p>
      </div>
    );
  }

  // Error State
  if (loadingState === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-sm font-semibold text-red-900">Error Loading Submissions</h3>
          </div>
          <p className="text-xs text-red-700 mb-3">{errorMessage}</p>
          <button
            onClick={fetchSubmissions}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="bg-gray-50 rounded-full p-4 mb-3">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No Submissions Yet</h3>
        <p className="text-xs text-gray-600 text-center max-w-sm">
          This form hasn&apos;t received any submissions yet. Share your form to start collecting responses.
        </p>
      </div>
    );
  }

  // Success State with Data
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Submissions ({submissions.length})
          </h3>
          <p className="text-xs text-gray-600">
            Most recent submissions appear first
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Submissions List */}
      <div className="space-y-2">
        {submissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            fields={fields}
          />
        ))}
      </div>
    </div>
  );
}
