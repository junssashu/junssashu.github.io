/**
 * TemplateManager component
 * Manages template saving, loading, and deletion
 */

import React, { useState } from 'react';
import { useTemplates } from '../context/TemplateContext';
import { useInvoice } from '@/features/invoice/context/InvoiceContext';
import { TemplateList } from '.';
import { SaveTemplateModal } from '.';
import { Button } from '@/shared/components/ui';
import { Plus, Loader } from 'lucide-react';

interface TemplateManagerProps {
  onClose: () => void;
}

const TemplateManager = ({ onClose }: TemplateManagerProps) => {
  const { templates, storageInfo, loadTemplate } = useTemplates();
  const { invoice, resetInvoice } = useInvoice();
  
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Open save template modal
  const handleOpenSaveModal = () => {
    setIsSaveModalOpen(true);
  };
  
  // Close save template modal
  const handleCloseSaveModal = () => {
    setIsSaveModalOpen(false);
  };
  
  // Load a template
  const handleLoadTemplate = async (templateId: string) => {
    // Check if current invoice has products
    const hasProducts = invoice.products.length > 0;
    
    // If has products, confirm before loading template
    if (hasProducts) {
      const confirmed = confirm(
        'Loading this template will replace your current products. Do you want to continue?'
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Reset the current invoice
      resetInvoice();
      
      // Load the template
      loadTemplate(templateId);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Template storage info */}
      <div className="bg-primary-50 rounded-lg p-4 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-primary-900">Storage Usage</h3>
          <p className="text-xs text-primary-700 mt-1">
            {storageInfo.templateCount} of {storageInfo.maxTemplates} templates used
          </p>
        </div>
        <div className="text-right">
          <div className="w-32 bg-neutral-200 rounded-full h-2 mb-1">
            <div 
              className="bg-accent-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(storageInfo.templateCount / storageInfo.maxTemplates) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-primary-500">
            {Math.round((storageInfo.templateCount / storageInfo.maxTemplates) * 100)}% used
          </p>
        </div>
      </div>
      
      {/* Template list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="h-6 w-6 text-accent-500 animate-spin" />
          <span className="ml-2 text-primary-700">Loading template...</span>
        </div>
      ) : (
        <TemplateList
          templates={templates}
          onLoadTemplate={handleLoadTemplate}
        />
      )}
      
      {/* Save current as template button */}
      <Button
        variant="primary"
        fullWidth
        leftIcon={<Plus size={16} />}
        onClick={handleOpenSaveModal}
        disabled={!invoice.products.length || isLoading}
      >
        Save Current as Template
      </Button>
      
      {/* Save Template Modal */}
      <SaveTemplateModal
        isOpen={isSaveModalOpen}
        onClose={handleCloseSaveModal}
      />
    </div>
  );
};

export default TemplateManager;

export { TemplateManager }