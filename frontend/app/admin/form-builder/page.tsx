'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { useFormBuilder } from '@/hooks/useFormBuilder';
import FieldPalette from '@/components/form-builder/FieldPalette';
import FormCanvas from '@/components/form-builder/FormCanvas';
import FieldSettingsPanel from '@/components/form-builder/FieldSettingsPanel';
import FormPreviewModal from '@/components/form-builder/FormPreviewModal';
import apiClient from '@/lib/api-client';
import RelationsDesigner from '@/components/form-builder/RelationsDesigner';

export default function FormBuilderPage() {
  const router = useRouter();
  const {
    state,
    loading,
    addField,
    updateField,
    deleteField,
    selectField,
    reorderFields,
    addRelationship,
    removeRelationship,
    saveForm,
    togglePreview,
    updateFormMetadata,
  } = useFormBuilder();

  // Check permissions on load
  useEffect(() => {
    const currentUser = apiClient.auth.getUser();
    if (!currentUser) {
      router.push('/admin/login');
      return;
    }
    
    if (currentUser.role !== 'superemployee') {
      alert('Access denied. Only Super Employees can access the form builder.');
      router.push('/admin/dashboard');
      return;
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {state.isEditMode ? 'Edit Form' : 'Create New Form'}
              </h1>
              <p className="text-xs text-gray-600">
                {state.isEditMode 
                  ? 'Update your form fields and settings' 
                  : 'Design your form by adding and configuring fields'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={togglePreview}
              disabled={state.fields.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={saveForm}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="w-3.5 h-3.5" />
              {loading ? 'Saving...' : (state.isEditMode ? 'Update' : 'Save')}
            </button>

            {/* Delete button only when editing and user is admin / superemployee */}
            {state.isEditMode && (() => {
              try {
                const currentUser = apiClient.auth.getUser();
                const allowed = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superemployee');
                if (!allowed) return null;
              } catch (e) {
                return null;
              }

              const handleDelete = async () => {
                if (!state.formSlug) return;
                if (!confirm('Are you sure you want to permanently delete this form? This action cannot be undone.')) return;
                try {
                  await apiClient.forms.deleteForm(state.formSlug);
                  alert('Form deleted successfully');
                  router.push('/admin/dashboard');
                } catch (err: any) {
                  console.error('Failed to delete form', err);
                  alert(`Failed to delete form: ${err?.data?.detail || err?.message || err}`);
                }
              };

              return (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              );
            })()}
          </div>
        </div>

        {/* Form Metadata */}
        <div className="mt-2 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Form Name *</label>
            <input
              type="text"
              value={state.formName}
              onChange={(e) => updateFormMetadata({ formName: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter form name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={state.formDescription}
              onChange={(e) => updateFormMetadata({ formDescription: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter form description"
            />
          </div>
        </div>
      </div>

      {/* Main Content - 3 Column Layout */}
      <div className="flex-1 flex overflow-auto">
        {/* Left: Field Palette */}
        <FieldPalette onAddField={addField} />

        {/* Center: Form Canvas */}
        <FormCanvas
          fields={state.fields}
          selectedField={state.selectedField}
          onSelectField={selectField}
          onDeleteField={deleteField}
          onReorderFields={reorderFields}
        />

        {/* Right: Field Settings */}
        <FieldSettingsPanel
          field={state.selectedField}
          onUpdateField={updateField}
        />
      </div>

      {/* Relations Designer */}
      <div className="px-4 mt-16">
        <RelationsDesigner
          currentFormSlug={state.formSlug}
          currentFields={state.fields}
          currentRelationships={state.relationships}
          addRelationship={addRelationship}
          removeRelationship={removeRelationship}
        />
      </div>

      {/* Preview Modal */}
      <FormPreviewModal
        isOpen={state.showPreview}
        onClose={togglePreview}
        formName={state.formName}
        formDescription={state.formDescription}
        fields={state.fields}
      />
    </div>
  );
}
