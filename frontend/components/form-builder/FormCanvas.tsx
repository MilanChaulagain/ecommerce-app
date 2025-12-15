'use client';

import React from 'react';
import { GripVertical, X } from 'lucide-react';
import { FormField } from '@/lib/form-builder-types';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormCanvasProps {
  fields: FormField[];
  selectedField: FormField | null;
  onSelectField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields: (newFields: FormField[]) => void;
}

const SortableField = ({ 
  field, 
  selectedField, 
  onSelectField, 
  onDeleteField 
}: { 
  field: FormField; 
  selectedField: FormField | null; 
  onSelectField: (field: FormField) => void; 
  onDeleteField: (fieldId: string) => void; 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: field.id 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderFieldPreview = (field: FormField) => {
    const baseClasses = "w-full px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 bg-gray-50";
    
    switch (field.type) {
      case 'textarea':
        return <textarea className={baseClasses} placeholder={field.placeholder} disabled />;
      case 'select':
        return (
          <select 
            key={`select-${field.id}-${field.options?.length || 0}`}
            className={baseClasses} 
            disabled
          >
            <option>{field.placeholder || 'Select...'}</option>
            {field.options && field.options.length > 0 ? (
              field.options.map((opt, idx) => (
                <option key={`${field.id}-opt-${idx}-${opt.value}`} value={opt.value}>
                  {opt.label}
                </option>
              ))
            ) : (
              <option disabled>No options added yet</option>
            )}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-1.5">
            <input type="checkbox" className="w-3.5 h-3.5" disabled defaultChecked={field.defaultChecked} />
            <span className="text-xs text-gray-700">{field.label}</span>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-1">
            {field.options && field.options.length > 0 ? (
              field.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <input type="radio" name={field.name} className="w-3.5 h-3.5" disabled />
                  <span className="text-xs text-gray-700">{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-gray-400 italic">No options added yet</div>
            )}
          </div>
        );
      case 'image':
        return (
          <div className="flex flex-col gap-1">
            <input type="file" accept={field.accept || 'image/*'} disabled className="block w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700" />
            <span className="text-[10px] text-gray-400">Image upload (preview only)</span>
          </div>
        );
      case 'video':
        return (
          <div className="flex flex-col gap-1">
            <input type="file" accept={field.accept || 'video/*'} disabled className="block w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700" />
            <span className="text-[10px] text-gray-400">Video upload (preview only)</span>
          </div>
        );
      default:
        return <input type={field.type} className={baseClasses} placeholder={field.placeholder} disabled />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelectField(field)}
      className={`relative p-2 rounded border transition-all cursor-pointer ${
        selectedField?.id === field.id
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-400 mt-0.5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                {field.type}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteField(field.id);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0.5 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {field.type !== 'checkbox' && (
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {renderFieldPreview(field)}
        </div>
      </div>
    </div>
  );
};

export default function FormCanvas({ 
  fields, 
  selectedField, 
  onSelectField, 
  onDeleteField,
  onReorderFields 
}: FormCanvasProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);
      
      const newFields = [...fields];
      const [movedField] = newFields.splice(oldIndex, 1);
      newFields.splice(newIndex, 0, movedField);
      
      onReorderFields(newFields);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-3 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-white rounded shadow-sm border border-gray-200 p-3">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Form Canvas</h3>
        
        {fields.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-xs">No fields added yet</p>
            <p className="text-xs mt-0.5 text-gray-400">Click on a field type to add it to your form</p>
          </div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {fields.map((field) => (
                  <SortableField
                    key={field.id}
                    field={field}
                    selectedField={selectedField}
                    onSelectField={onSelectField}
                    onDeleteField={onDeleteField}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
