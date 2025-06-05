/**
 * TemplateList component
 * Displays list of saved templates
 */

import React from 'react';
import { Template } from '../types/template.types';
import { TemplateCard } from '.';

interface TemplateListProps {
  templates: Template[];
  onLoadTemplate: (templateId: string) => void;
}

const TemplateList = ({ templates, onLoadTemplate }: TemplateListProps) => {
  // If no templates, show empty state
  if (templates.length === 0) {
    return (
      <div className="text-center py-8 px-4 border border-dashed border-neutral-300 rounded-lg">
        <h3 className="font-medium text-primary-900 mb-1">No Templates Saved</h3>
        <p className="text-sm text-neutral-500">
          Save your commonly used products as templates for quick reuse.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onLoadTemplate={onLoadTemplate}
        />
      ))}
    </div>
  );
};

export default TemplateList;