/**
 * InvoiceSettings component
 * Manages invoice-specific settings
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useInvoice } from '../context/InvoiceContext';
import { InvoiceSettings as InvoiceSettingsType } from '../types/invoice.types';
import { Button, Input } from '@/shared/components/ui';
import { Save } from 'lucide-react';

interface InvoiceSettingsProps {
  onSubmit: () => void;
}

const InvoiceSettings = ({ onSubmit }: InvoiceSettingsProps) => {
  const { invoice, updateSettings } = useInvoice();
  
  // Set up form with existing settings
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<Partial<InvoiceSettingsType>>({
    defaultValues: invoice.settings,
    mode: 'onChange',
  });
  
  // Handle form submission
  const handleFormSubmit = (data: Partial<InvoiceSettingsType>) => {
    updateSettings(data);
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="invoiceNumber" className="block text-sm font-medium text-primary-900 mb-1">
          Invoice Number*
        </label>
        <Input
          id="invoiceNumber"
          placeholder="Invoice Number"
          error={errors.invoiceNumber?.message}
          fullWidth
          {...register('invoiceNumber', { required: 'Invoice number is required' })}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-primary-900 mb-1">
            Issue Date*
          </label>
          <Input
            id="issueDate"
            type="date"
            error={errors.issueDate?.message}
            fullWidth
            {...register('issueDate', { required: 'Issue date is required' })}
          />
        </div>
        
        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-primary-900 mb-1">
            Due Date
          </label>
          <Input
            id="dueDate"
            type="date"
            fullWidth
            {...register('dueDate')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-primary-900 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          placeholder="Additional notes to appear on the invoice"
          className="w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
          rows={3}
          {...register('notes')}
        />
      </div>
      
      <div>
        <label htmlFor="terms" className="block text-sm font-medium text-primary-900 mb-1">
          Terms & Conditions
        </label>
        <textarea
          id="terms"
          placeholder="Terms and conditions for this invoice"
          className="w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
          rows={3}
          {...register('terms')}
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <input
            id="showDiscounts"
            type="checkbox"
            className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-neutral-300 rounded"
            {...register('showDiscounts')}
          />
          <label htmlFor="showDiscounts" className="ml-2 block text-sm text-primary-900">
            Show discounts
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="showTaxes"
            type="checkbox"
            className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-neutral-300 rounded"
            {...register('showTaxes')}
          />
          <label htmlFor="showTaxes" className="ml-2 block text-sm text-primary-900">
            Show taxes
          </label>
        </div>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          fullWidth
          leftIcon={<Save size={16} />}
          disabled={!isValid}
        >
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default InvoiceSettings;

export { InvoiceSettings }