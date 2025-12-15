// Field type definitions for the form builder
import { 
  Type, Mail, Hash, Phone, AlignLeft, Calendar, 
  Clock, ChevronDown, CheckSquare, Circle, Link, Image as ImageIcon, Video as VideoIcon
} from 'lucide-react';
import { FieldTypeDefinition } from '@/lib/form-builder-types';

export const FIELD_TYPES: FieldTypeDefinition[] = [
  { type: 'text', label: 'Text Input', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'tel', label: 'Phone', icon: Phone },
  { type: 'textarea', label: 'Text Area', icon: AlignLeft },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'select', label: 'Dropdown', icon: ChevronDown },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'radio', label: 'Radio Button', icon: Circle },
  { type: 'url', label: 'URL', icon: Link },
  { type: 'image', label: 'Image Upload', icon: ImageIcon },
  { type: 'video', label: 'Video Upload', icon: VideoIcon },
];
