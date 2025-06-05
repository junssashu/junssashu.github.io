/**
 * PreferencesForm component
 * Manages enterprise preferences and settings
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useEnterprise } from '../context/EnterpriseContext';
import { EnterpriseSettings } from '../types/enterprise.types';
import { Button, Input } from '@/shared/components/ui';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// Common currencies
const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', decimals: 2 },
];

// Date formats
const dateFormats = [
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (e.g., 12/31/2023)' },
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (e.g., 31/12/2023)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (e.g., 2023-12-31)' },
  { value: 'MMMM dd, yyyy', label: 'Month DD, YYYY (e.g., December 31, 2023)' },
  { value: 'dd MMMM yyyy', label: 'DD Month YYYY (e.g., 31 December 2023)' },
];

interface PreferencesFormProps {
  onNext: () => void;
  onBack: () => void;
}

const PreferencesForm = ({ onNext, onBack }: PreferencesFormProps) => {
  const { enterprise, updateSettings } = useEnterprise();
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<EnterpriseSettings>({
    defaultValues: enterprise.settings,
  });
  
  // Handle currency selection
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selected = currencies.find(c => c.code === code);
    
    if (selected) {
      setValue('currency', selected);
    }
  };
  
  // Save preferences
  const onSubmit = (data: EnterpriseSettings) => {
    updateSettings(data);
    onNext();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-primary-900">Preferences</h2>
        <p className="text-neutral-500 mt-1">Set your invoice preferences.</p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-primary-900 mb-1">
          Currency
        </label>
        <select
          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
          value={enterprise.settings.currency.code}
          onChange={handleCurrencyChange}
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-primary-900 mb-1">
          Date Format
        </label>
        <select
          className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
          {...register('dateFormat')}
        >
          {dateFormats.map((format) => (
            <option key={format.value} value={format.value}>
              {format.label}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="invoiceNumberPrefix" className="block text-sm font-medium text-primary-900 mb-1">
          Invoice Number Prefix
        </label>
        <Input
          id="invoiceNumberPrefix"
          {...register('invoiceNumberPrefix')}
          placeholder="e.g., INV-"
          fullWidth
        />
      </div>
      
      <div>
        <label htmlFor="nextInvoiceNumber" className="block text-sm font-medium text-primary-900 mb-1">
          Next Invoice Number
        </label>
        <Input
          id="nextInvoiceNumber"
          type="number"
          min="1"
          {...register('nextInvoiceNumber', { 
            valueAsNumber: true,
            min: {
              value: 1,
              message: 'Invoice number must be positive',
            },
          })}
          error={errors.nextInvoiceNumber?.message}
          fullWidth
        />
      </div>
      
      <div className="flex items-center">
        <input
          id="showLogo"
          type="checkbox"
          className="h-4 w-4 text-accent-600 focus:ring-accent-500 border-neutral-300 rounded"
          {...register('showLogo')}
        />
        <label htmlFor="showLogo" className="ml-2 block text-sm text-primary-900">
          Show logo on invoices
        </label>
      </div>
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
        <Button
          type="submit"
          rightIcon={<ArrowRight size={16} />}
        >
          Next: Complete
        </Button>
      </div>
    </form>
  );
};

export default PreferencesForm;