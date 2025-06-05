/**
 * Template storage service
 * Handles saving and retrieving templates
 */

import { getFromStorage, saveToStorage } from '@/shared/services/storageService';
import { Template } from '../types/template.types';
import { TEMPLATE_LIMITS } from '@/shared/constants/storage.constants';

/**
 * Loads templates from storage
 */
export const loadTemplates = (): Template[] => {
  const templates = getFromStorage<Template[]>('templates');
  return templates || [];
};

/**
 * Saves templates to storage
 */
export const saveTemplates = (templates: Template[]): boolean => {
  // Sort by last used (most recent first)
  const sortedTemplates = [...templates].sort((a, b) => {
    // If both have lastUsed dates, compare them
    if (a.metadata.lastUsed && b.metadata.lastUsed) {
      return new Date(b.metadata.lastUsed).getTime() - new Date(a.metadata.lastUsed).getTime();
    }
    
    // If only one has lastUsed, prioritize it
    if (a.metadata.lastUsed) return -1;
    if (b.metadata.lastUsed) return 1;
    
    // If neither has lastUsed, sort by creation date
    return new Date(b.metadata.created).getTime() - new Date(a.metadata.created).getTime();
  });
  
  // If we exceed the template limit, trim the list (remove oldest)
  const trimmedTemplates = sortedTemplates.slice(0, TEMPLATE_LIMITS.maxTemplates);
  
  return saveToStorage('templates', trimmedTemplates);
};

/**
 * Creates a new template
 */
export const createTemplate = (
  name: string,
  products: Array<any>,
  category?: string
): boolean => {
  const templates = loadTemplates();
  
  // Check if we're at the limit
  if (templates.length >= TEMPLATE_LIMITS.maxTemplates) {
    // Sort by last used (oldest first)
    templates.sort((a, b) => {
      // If both have lastUsed dates, compare them
      if (a.metadata.lastUsed && b.metadata.lastUsed) {
        return new Date(a.metadata.lastUsed).getTime() - new Date(b.metadata.lastUsed).getTime();
      }
      
      // If only one has lastUsed, prioritize the one without
      if (a.metadata.lastUsed) return 1;
      if (b.metadata.lastUsed) return -1;
      
      // If neither has lastUsed, sort by creation date (oldest first)
      return new Date(a.metadata.created).getTime() - new Date(b.metadata.created).getTime();
    });
    
    // Remove the oldest template
    templates.shift();
  }
  
  // Create new template
  const newTemplate: Template = {
    id: `template-${Date.now()}`,
    name,
    category,
    products,
    metadata: {
      created: new Date().toISOString(),
      useCount: 0,
    },
  };
  
  // Save updated templates
  return saveTemplates([...templates, newTemplate]);
};

/**
 * Updates an existing template
 */
export const updateTemplate = (id: string, updates: Partial<Template>): boolean => {
  const templates = loadTemplates();
  
  const updatedTemplates = templates.map(template => {
    if (template.id === id) {
      return {
        ...template,
        ...updates,
        // Preserve metadata structure
        metadata: {
          ...template.metadata,
          ...(updates.metadata || {}),
        },
      };
    }
    return template;
  });
  
  return saveTemplates(updatedTemplates);
};

/**
 * Deletes a template
 */
export const deleteTemplate = (id: string): boolean => {
  const templates = loadTemplates();
  const filteredTemplates = templates.filter(template => template.id !== id);
  return saveTemplates(filteredTemplates);
};

/**
 * Updates the last used timestamp and increments use count
 */
export const markTemplateUsed = (id: string): boolean => {
  const templates = loadTemplates();
  
  const updatedTemplates = templates.map(template => {
    if (template.id === id) {
      return {
        ...template,
        metadata: {
          ...template.metadata,
          lastUsed: new Date().toISOString(),
          useCount: template.metadata.useCount + 1,
        },
      };
    }
    return template;
  });
  
  return saveTemplates(updatedTemplates);
};