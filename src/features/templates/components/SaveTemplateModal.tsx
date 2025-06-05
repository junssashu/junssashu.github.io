/**
 * SaveTemplateModal component
 * Form for saving the current invoice as a template
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTemplates } from '../context/TemplateContext';
import { useInvoice } from '@/features/invoice/context/InvoiceContext';
import { TemplateFormData } from '../types/template.types';
import { Button, Input, Modal } from '@/shared/components/ui';
import { Save } from 'lucide-react';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveTemplateModal = ({ isOpen, onClose }: SaveTemplateModalProps) => {
  const { createTemplate, storageInfo } = useTemplates();
  const { invoice } = useInvoice();
  
  // Set up form
  const { register, handleSubmit, reset, formState: { errors, isValid } } = useForm<TemplateFormData>({
    defaultValues: {
      name: '',
      category: '',
    },
    mode: 'onChange',
  });
  
  // Handle form submission
  const onSubmit = (data: TemplateFormData) => {
    // Skip empty category
    const category = data.category?.trim() || undefined;
    
    // Create template
    const success = createTemplate(
      data.name,
      invoice.products,
      category
    );
    
    if (success) {
      // Reset form and close modal
      reset();
      onClose();
    } else {
      // Handle error (likely storage limit reached)
      alert('Could not save template. You may have reached your storage limit.');
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save as Template"
      description="Save your current products for future use"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Storage warning */}
        {storageInfo.isApproachingLimit && (
          <div className="bg-warning-50 border border-warning-200 rounded-md p-3 text-warning-800 text-sm">
            <p>
              You have {storageInfo.templateCount} of {storageInfo.maxTemplates} templates used.
              {storageInfo.isAtLimit 
                ? ' The oldest template will be replaced if you save a new one.'
                : ' Approaching template limit.'}
            </p>
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-1">
            Template Name*
          </label>
          <Input
            id="name"
            placeholder="e.g., Web Development Services"
            error={errors.name?.message}
            fullWidth
            {...register('name', { 
              required: 'Template name is required',
              maxLength: {
                value: 50,
                message: 'Name cannot exceed 50 characters',
              },
            })}
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-primary-900 mb-1">
            Category (Optional)
          </label>
          <Input
            id="category"
            placeholder="e.g., Services, Products, etc."
            fullWidth
            {...register('category', { 
              maxLength: {
                value: 30,
                message: 'Category cannot exceed 30 characters',
              },
            })}
            error={errors.category?.message}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Categories help you organize your templates
          </p>
        </div>
        
        <div className="pt-4">
          <Button
            type="submit"
            fullWidth
            leftIcon={<Save size={16} />}
            disabled={!isValid || !invoice.products.length}
          >
            Save Template
          </Button>
          
          {!invoice.products.length && (
            <p className="text-xs text-danger-600 text-center mt-2">
              You need to add products before saving a template
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default SaveTemplateModal;