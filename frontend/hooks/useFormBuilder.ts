'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  FormField, 
  FieldType, 
  FormBuilderState,
  toBackendFieldStructure,
  fromBackendFieldStructure,
  FormSchema,
} from '@/lib/form-builder-types';
import apiClient from '@/lib/api-client';

export function useFormBuilder() {
  const searchParams = useSearchParams();
  const formSlugFromUrl = searchParams.get('slug'); // Changed from 'id' to 'slug'

  const [state, setState] = useState<FormBuilderState>({
    formId: null,
    formSlug: null,
    formName: '',
    formDescription: '',
    fields: [],
    selectedField: null,
    isEditMode: false,
    showPreview: false,
    languageConfig: {
      primary: 'en',
      optional: ['nep'],
    },
    relationships: [],
    currentLanguage: 'en',
  });

  const [loading, setLoading] = useState(false);

  // Load form data if editing
  useEffect(() => {
    if (formSlugFromUrl) {
      loadForm(formSlugFromUrl);
    }
  }, [formSlugFromUrl]);

  const loadForm = async (slug: string) => {
    setLoading(true);
    try {
      const formData = await apiClient.forms.getForm(slug);
      console.debug('useFormBuilder.loadForm: fetched form relationships', formData.relationships);
      
      // Convert backend field structure to frontend format
      const frontendFields = formData.fields_structure.map(field => 
        fromBackendFieldStructure(field, formData.language_config.primary)
      );
      
      setState(prev => ({
        ...prev,
        formId: formData.id,
        formSlug: formData.slug,
        formName: formData.title,
        formDescription: formData.description || '',
        fields: frontendFields,
        languageConfig: formData.language_config,
        relationships: formData.relationships || [],
        currentLanguage: formData.language_config.primary,
        isEditMode: true,
      }));
    } catch (error) {
      console.error('Error loading form:', error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      alert(`Failed to load form: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const addField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      name: `field_${state.fields.length + 1}`,
      placeholder: type === 'select' ? 'Select an option' : `Enter ${type}`,
      required: false,
      options: (type === 'select' || type === 'radio') ? [
        { value: 'option_1', label: 'Option 1' },
        { value: 'option_2', label: 'Option 2' },
        { value: 'option_3', label: 'Option 3' },
      ] : undefined,
    };

    setState(prev => ({
      ...prev,
      fields: [...prev.fields, newField],
      selectedField: newField,
    }));
  };

  const updateField = (updates: Partial<FormField>) => {
    if (!state.selectedField) return;

    setState(prev => {
      if (!prev.selectedField) return prev;
      
      const updatedField = { ...prev.selectedField, ...updates };
      
      return {
        ...prev,
        fields: prev.fields.map(f => 
          f.id === prev.selectedField?.id ? updatedField : f
        ),
        selectedField: updatedField,
      };
    });
  };

  const deleteField = (fieldId: string) => {
    setState(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
      selectedField: prev.selectedField?.id === fieldId ? null : prev.selectedField,
    }));
  };

  const selectField = (field: FormField) => {
    setState(prev => {
      // Always select the field from the fields array to ensure we have the latest state
      const fieldFromArray = prev.fields.find(f => f.id === field.id);
      return { ...prev, selectedField: fieldFromArray || field };
    });
  };

  const reorderFields = (newFields: FormField[]) => {
    setState(prev => {
      // Update selectedField reference if it exists in the reordered fields
      const updatedSelectedField = prev.selectedField 
        ? newFields.find(f => f.id === prev.selectedField?.id) || prev.selectedField
        : null;
      return { ...prev, fields: newFields, selectedField: updatedSelectedField };
    });
  };

  const saveForm = async () => {
    if (!state.formName.trim()) {
      alert('Please enter a form name');
      return;
    }

    if (state.fields.length === 0) {
      alert('Please add at least one field');
      return;
    }

    // Check user permissions
    const currentUser = apiClient.auth.getUser();
    if (!currentUser) {
      alert('You must be logged in to save forms');
      return;
    }

    if (currentUser.role !== 'superemployee') {
      console.log(currentUser.role)
      alert('You do not have permission to create or edit forms. Only Super Employees can manage forms.');
      return;
    }

    setLoading(true);
    try {
      // Convert frontend fields to backend structure
      const backendFields = state.fields.map(field => 
        toBackendFieldStructure(field, state.languageConfig)
      );

      const payload = {
        title: state.formName,
        description: state.formDescription,
        language_config: state.languageConfig,
        fields_structure: backendFields,
        relationships: state.relationships,
      };

      let formData: FormSchema;
      
      if (state.isEditMode && state.formSlug) {
        // Update existing form
        formData = await apiClient.forms.updateForm(state.formSlug, payload);
        alert('Form updated successfully!');
        
        // Update state with returned data
        setState(prev => ({
          ...prev,
          formId: formData.id,
          formSlug: formData.slug,
        }));
      } else {
        // Create new form
        formData = await apiClient.forms.createForm(payload);
        alert(`Form created successfully! Slug: ${formData.slug}`);
        
        // Reset form after creation
        setState({
          formId: null,
          formSlug: null,
          formName: '',
          formDescription: '',
          fields: [],
          selectedField: null,
          isEditMode: false,
          showPreview: false,
          languageConfig: {
            primary: 'en',
            optional: [],
          },
          relationships: [],
          currentLanguage: 'en',
        });
      }
    } catch (error) {
      console.error('Error saving form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      alert(`Failed to save form: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  };

  const updateFormMetadata = (updates: { formName?: string; formDescription?: string }) => {
    setState(prev => ({
      ...prev,
      formName: updates.formName ?? prev.formName,
      formDescription: updates.formDescription ?? prev.formDescription,
    }));
  };

  const updateLanguageConfig = (languageConfig: { primary: string; optional: string[] }) => {
    setState(prev => ({
      ...prev,
      languageConfig,
    }));
  };

  const addRelationship = (relationship: { field_id: string; target_form_slug: string; display_field: string }) => {
    setState(prev => ({
      ...prev,
      relationships: [...prev.relationships, relationship],
    }));
  };

  const removeRelationship = (fieldId: string) => {
    setState(prev => ({
      ...prev,
      relationships: prev.relationships.filter(r => r.field_id !== fieldId),
    }));
  };

  return {
    state,
    loading,
    addField,
    updateField,
    deleteField,
    selectField,
    reorderFields,
    saveForm,
    togglePreview,
    updateFormMetadata,
    updateLanguageConfig,
    addRelationship,
    removeRelationship,
  };
}
