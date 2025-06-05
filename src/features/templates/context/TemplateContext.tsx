/**
 * Template context provider
 * Manages template state including saving, loading, and using templates
 */

import { createContext, useContext, ReactNode } from 'react';
import { Template, TemplateContextType } from '../types/template.types';
import { useStorage } from '@/shared/hooks/useStorage';
import { createTemplate, deleteTemplate, updateTemplate, markTemplateUsed } from '../services/templateStorage';
import { TEMPLATE_LIMITS } from '@/shared/constants/storage.constants';

// Create context
const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export const TemplateProvider = ({ children }: { children: ReactNode }) => {
  // Load templates from storage
  const { 
    value: templates, 
    setValue: setTemplates,
    sizeInfo 
  } = useStorage<Template[]>('templates', []);
  
  // Track selected template
  const { 
    value: selectedTemplate, 
    setValue: setSelectedTemplate 
  } = useStorage<Template | null>('selectedTemplate', null);
  
  // Load a template
  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // Mark template as used
      markTemplateUsed(templateId);
      
      // Update local state
      setSelectedTemplate(template);
      
      // Update templates in storage with new use count and date
      const updatedTemplates = templates.map(t => 
        t.id === templateId
          ? {
              ...t,
              metadata: {
                ...t.metadata,
                lastUsed: new Date().toISOString(),
                useCount: t.metadata.useCount + 1,
              },
            }
          : t
      );
      
      setTemplates(updatedTemplates);
    }
  };
  
  // Create a new template
  const createNewTemplate = (name: string, products: any[], category?: string) => {
    if (createTemplate(name, products, category)) {
      // Reload templates
      const updated = getFromStorage<Template[]>('templates') || [];
      setTemplates(updated);
      return true;
    }
    return false;
  };
  
  // Update an existing template
  const updateExistingTemplate = (id: string, updates: Partial<Template>) => {
    if (updateTemplate(id, updates)) {
      // Reload templates
      const updated = getFromStorage<Template[]>('templates') || [];
      setTemplates(updated);
      return true;
    }
    return false;
  };
  
  // Delete a template
  const deleteExistingTemplate = (id: string) => {
    if (deleteTemplate(id)) {
      // Reload templates
      const updated = getFromStorage<Template[]>('templates') || [];
      setTemplates(updated);
      
      // Clear selected template if it was deleted
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
    }
  };
  
  // Clear selected template
  const clearSelectedTemplate = () => {
    setSelectedTemplate(null);
  };
  
  // Get storage info
  const storageInfo = {
    size: sizeInfo.size,
    percentUsed: sizeInfo.percentUsed,
    isApproachingLimit: sizeInfo.isApproachingLimit,
    isAtLimit: sizeInfo.isAtLimit,
    templateCount: templates.length,
    maxTemplates: TEMPLATE_LIMITS.maxTemplates,
  };
  
  // Context value
  const value: TemplateContextType = {
    templates,
    selectedTemplate,
    loadTemplate,
    createTemplate: createNewTemplate,
    updateTemplate: updateExistingTemplate,
    deleteTemplate: deleteExistingTemplate,
    clearSelectedTemplate,
    storageInfo,
  };
  
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

// Custom hook to use template context
export const useTemplates = (): TemplateContextType => {
  const context = useContext(TemplateContext);
  
  if (context === undefined) {
    throw new Error('useTemplates must be used within a TemplateProvider');
  }
  
  return context;
};

// Helper function to get data from storage
function getFromStorage<T>(key: string): T | null {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error getting ${key} from storage:`, e);
    return null;
  }
}