/**
 * Template type definitions
 */

import { Product } from '@/features/invoice/types/product.types';

export interface Template {
  id: string;
  name: string;
  category?: string;
  products: Product[];
  metadata: {
    created: string;
    lastUsed?: string;
    useCount: number;
  };
}

export interface TemplateContextType {
  templates: Template[];
  selectedTemplate: Template | null;
  loadTemplate: (templateId: string) => void;
  createTemplate: (name: string, products: Product[], category?: string) => boolean;
  updateTemplate: (id: string, updates: Partial<Template>) => boolean;
  deleteTemplate: (id: string) => void;
  clearSelectedTemplate: () => void;
  storageInfo: {
    size: number;
    percentUsed: number;
    isApproachingLimit: boolean;
    isAtLimit: boolean;
    templateCount: number;
    maxTemplates: number;
  };
}

export interface TemplateFormData {
  name: string;
  category?: string;
}