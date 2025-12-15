// Type definitions for Form Builder (aligned with backend FormSchema)
import { LucideIcon } from 'lucide-react';

// Backend field types (add image, video)
export type BackendFieldType = 'text' | 'number' | 'dropdown' | 'radio' | 'checkbox' | 'image' | 'video';

// Frontend field types (UI uses 'select' instead of 'dropdown')
export type FieldType =
  | 'text'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'date'
  | 'time'
  | 'url'
  | 'image'
  | 'video';

export interface FieldOption {
  value: string;
  label: string;
}

// Backend-compatible field structure
export interface FormFieldStructure {
  id: string;
  type: BackendFieldType;
  labels: { [languageCode: string]: string }; // e.g., { "en": "Full Name", "es": "Nombre" }
  descriptions?: { [languageCode: string]: string };
  required: boolean;
  options?: string[]; // For dropdown/radio - just values, labels come from translations
  // For image/video fields
  accept?: string; // e.g., 'image/*', 'video/mp4', etc.
  maxSizeMB?: number;
}

// Frontend form field (extended for UI)
export interface FormField {
  id: string;
  type: FieldType;
  label: string; // Primary language label
  labels?: { [languageCode: string]: string }; // Multi-language labels
  name: string;
  placeholder?: string;
  required: boolean;
  options?: FieldOption[]; // Frontend uses value+label pairs
  descriptions?: { [languageCode: string]: string };
  defaultValue?: string;
  defaultChecked?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  allowMultiple?: boolean;
  // For image/video fields
  accept?: string; // e.g., 'image/*', 'video/mp4', etc.
  maxSizeMB?: number;
}

// Form relationship (for linking forms)
export interface FormRelationship {
  field_id: string;
  target_form_slug: string;
  display_field: string;
}

// Language configuration
export interface LanguageConfig {
  primary: string; // e.g., "en"
  optional: string[]; // e.g., ["es", "fr"]
}

export interface FieldTypeDefinition {
  type: FieldType;
  label: string;
  icon: LucideIcon;
}

// Backend FormSchema structure
export interface FormSchema {
  id: number;
  title: string;
  slug: string; // 8-char unique identifier
  description: string;
  language_config: LanguageConfig;
  fields_structure: FormFieldStructure[];
  relationships: FormRelationship[];
  created_by: number;
  created_at: string;
  updated_at: string;
  submission_count: number;
}

// Frontend form template (for compatibility)
export interface FormTemplate {
  id?: number;
  slug?: string;
  name: string;
  title?: string; // Backend uses 'title'
  description?: string;
  language_config?: LanguageConfig;
  fields_structure?: FormFieldStructure[];
  relationships?: FormRelationship[];
  schema?: {
    fields: FormField[];
  };
}

// Form builder state
export interface FormBuilderState {
  formId: number | null;
  formSlug: string | null;
  formName: string; // Maps to 'title' in backend
  formDescription: string;
  fields: FormField[];
  selectedField: FormField | null;
  isEditMode: boolean;
  showPreview: boolean;
  languageConfig: LanguageConfig;
  relationships: FormRelationship[];
  currentLanguage: string; // For editing multi-language fields
}

// Helper function to convert frontend field to backend structure
export function toBackendFieldStructure(
  field: FormField,
  languageConfig: LanguageConfig
): FormFieldStructure {
  let backendType: BackendFieldType;
  if (field.type === 'select') backendType = 'dropdown';
  else if (
    field.type === 'text' ||
    field.type === 'email' ||
    field.type === 'tel' ||
    field.type === 'textarea' ||
    field.type === 'date' ||
    field.type === 'time' ||
    field.type === 'url'
  ) backendType = 'text';
  else if (field.type === 'image') backendType = 'image';
  else if (field.type === 'video') backendType = 'video';
  else backendType = field.type as BackendFieldType;

  const backendField: FormFieldStructure = {
    id: field.id,
    type: backendType,
    labels: field.labels || { [languageConfig.primary]: field.label },
    descriptions: field.descriptions,
    required: field.required,
    options: field.options?.map(opt => opt.value),
  };
  if (field.type === 'image' || field.type === 'video') {
    backendField.accept = field.accept;
    backendField.maxSizeMB = field.maxSizeMB;
  }
  return backendField;
}

// Helper function to convert backend field to frontend structure
export function fromBackendFieldStructure(
  backendField: FormFieldStructure,
  primaryLanguage: string
): FormField {
  const type: FieldType = backendField.type === 'dropdown' ? 'select' : backendField.type as FieldType;
  const field: FormField = {
    id: backendField.id,
    type,
    label: backendField.labels[primaryLanguage] || Object.values(backendField.labels)[0] || '',
    labels: backendField.labels,
    name: backendField.id,
    required: backendField.required,
    options: backendField.options?.map((value) => {
      // Convert value to a readable label (capitalize and replace underscores with spaces)
      const label = value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return {
        value,
        label,
      };
    }),
    descriptions: backendField.descriptions,
  };
  if (type === 'image' || type === 'video') {
    field.accept = backendField.accept;
    field.maxSizeMB = backendField.maxSizeMB;
  }
  return field;
}
