/**
 * TaxConfigurationForm component
 * Manages tax settings for invoices
 */

import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { TaxConfig } from '@/shared/types/common.types';
import { Button, Card, Input } from '@/shared/components/ui';
import { Plus, Trash2, ArrowLeft, ArrowRight, Percent, DollarSign } from 'lucide-react';

interface TaxConfigurationFormProps {
  onNext: () => void;
  onBack: () => void;
}

const TaxConfigurationForm = ({ onNext, onBack }: TaxConfigurationFormProps) => {
  const { enterprise, updateTaxSettings } = useEnterprise();
  const [taxes, setTaxes] = useState<TaxConfig[]>(
    enterprise.taxSettings.taxes.length > 0
      ? enterprise.taxSettings.taxes
      : [{ id: 'tax-1', name: 'Tax', rate: 0, type: 'percentage', enabled: false }]
  );
  const [defaultTaxId, setDefaultTaxId] = useState<string>(
    enterprise.taxSettings.defaultTax || (taxes[0]?.id || 'tax-1')
  );
  
  // Add new tax
  const handleAddTax = () => {
    const newTax: TaxConfig = {
      id: `tax-${Date.now()}`,
      name: `Tax ${taxes.length + 1}`,
      rate: 0,
      type: 'percentage',
      enabled: true,
    };
    
    setTaxes([...taxes, newTax]);
  };
  
  // Remove tax
  const handleRemoveTax = (id: string) => {
    setTaxes(taxes.filter(tax => tax.id !== id));
    
    // If removing default tax, set a new default
    if (id === defaultTaxId && taxes.length > 1) {
      const newDefault = taxes.find(tax => tax.id !== id);
      if (newDefault) {
        setDefaultTaxId(newDefault.id);
      }
    }
  };
  
  // Update tax
  const handleTaxChange = (id: string, field: keyof TaxConfig, value: any) => {
    setTaxes(taxes.map(tax => {
      if (tax.id === id) {
        return { ...tax, [field]: value };
      }
      return tax;
    }));
  };
  
  // Toggle tax enabled state
  const handleToggleTaxEnabled = (id: string) => {
    setTaxes(taxes.map(tax => {
      if (tax.id === id) {
        return { ...tax, enabled: !tax.enabled };
      }
      return tax;
    }));
  };
  
  // Toggle tax type
  const handleToggleTaxType = (id: string) => {
    setTaxes(taxes.map(tax => {
      if (tax.id === id) {
        return { 
          ...tax, 
          type: tax.type === 'percentage' ? 'fixed' : 'percentage'
        };
      }
      return tax;
    }));
  };
  
  // Save tax settings
  const handleSave = () => {
    updateTaxSettings({
      taxes,
      defaultTax: defaultTaxId
    });
    
    onNext();
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-primary-900">Tax Settings</h2>
        <p className="text-neutral-500 mt-1">Configure taxes for your invoices.</p>
      </div>
      
      <div className="space-y-4">
        {taxes.map(tax => (
          <div 
            key={tax.id}
            className="border border-neutral-200 rounded-lg p-4 bg-white"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tax-enabled-${tax.id}`}
                    checked={tax.enabled}
                    onChange={() => handleToggleTaxEnabled(tax.id)}
                    className="h-4 w-4 text-accent-600 rounded border-neutral-300 focus:ring-accent-500"
                  />
                  <label 
                    htmlFor={`tax-enabled-${tax.id}`} 
                    className="ml-2 block text-sm font-medium text-primary-900"
                  >
                    Enabled
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`tax-default-${tax.id}`}
                    name="defaultTax"
                    checked={tax.id === defaultTaxId}
                    onChange={() => setDefaultTaxId(tax.id)}
                    className="h-4 w-4 text-accent-600 border-neutral-300 focus:ring-accent-500"
                  />
                  <label 
                    htmlFor={`tax-default-${tax.id}`} 
                    className="ml-2 block text-sm font-medium text-primary-900"
                  >
                    Default
                  </label>
                </div>
                
                {taxes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTax(tax.id)}
                    className="text-danger-500 hover:text-danger-700 p-1 rounded-full hover:bg-danger-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              
              <div>
                <label
                  htmlFor={`tax-name-${tax.id}`}
                  className="block text-sm font-medium text-primary-900 mb-1"
                >
                  Tax Name
                </label>
                <Input
                  id={`tax-name-${tax.id}`}
                  value={tax.name}
                  onChange={(e) => handleTaxChange(tax.id, 'name', e.target.value)}
                  placeholder="Tax Name"
                  fullWidth
                  disabled={!tax.enabled}
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label
                    htmlFor={`tax-rate-${tax.id}`}
                    className="block text-sm font-medium text-primary-900 mb-1"
                  >
                    Rate
                  </label>
                  <div className="relative">
                    <Input
                      id={`tax-rate-${tax.id}`}
                      type="number"
                      step={tax.type === 'percentage' ? '0.01' : '0.01'}
                      min="0"
                      value={tax.rate}
                      onChange={(e) => handleTaxChange(tax.id, 'rate', parseFloat(e.target.value) || 0)}
                      fullWidth
                      disabled={!tax.enabled}
                      rightIcon={
                        tax.type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />
                      }
                    />
                  </div>
                </div>
                
                <div className="flex-1">
                  <label
                    className="block text-sm font-medium text-primary-900 mb-1"
                  >
                    Type
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    fullWidth
                    disabled={!tax.enabled}
                    onClick={() => handleToggleTaxType(tax.id)}
                  >
                    {tax.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add Tax Button */}
      <Button
        type="button"
        variant="ghost"
        leftIcon={<Plus size={16} />}
        onClick={handleAddTax}
        className="w-full border border-dashed border-neutral-300 hover:border-accent-300"
      >
        Add Tax
      </Button>
      
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
          type="button"
          onClick={handleSave}
          rightIcon={<ArrowRight size={16} />}
        >
          Next: Preferences
        </Button>
      </div>
    </div>
  );
};

export default TaxConfigurationForm;