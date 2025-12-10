'use client';

import { useState } from 'react';
import { X, FileText, Database } from 'lucide-react';
import { FormSchema } from '@/lib/api-client';
import FormPreviewTab from './form-submissions/FormPreviewTab';
import SubmissionsTab from './form-submissions/SubmissionsTab';

interface FormViewModalProps {
  form: FormSchema | null;
  onClose: () => void;
  defaultTab?: 'preview' | 'submissions';
}

type TabType = 'preview' | 'submissions';

export default function FormViewModal({ form, onClose, defaultTab = 'preview' }: FormViewModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  if (!form) return null;

  const handleSubmitSuccess = () => {
    // Switch to submissions tab and trigger refresh
    setActiveTab('submissions');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between px-4 py-2">
            <h2 className="text-sm font-semibold text-gray-900">{form.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4 cursor-pointer hover:text-red-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-t border-gray-200">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Form Preview
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 px-4 py-2 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'submissions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Submissions ({form.submission_count})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
          {activeTab === 'preview' ? (
            <div>
              <div className="mb-4">
                {form.description && (
                  <p className="text-xs text-gray-600">{form.description}</p>
                )}
              </div>
              <FormPreviewTab form={form} onSubmitSuccess={handleSubmitSuccess} />
            </div>
          ) : (
            <SubmissionsTab form={form} refreshTrigger={refreshTrigger} />
          )}
        </div>
      </div>
    </div>
  );
}
