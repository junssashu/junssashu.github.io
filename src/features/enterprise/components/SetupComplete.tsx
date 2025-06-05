/**
 * SetupComplete component
 * Final step of the enterprise setup process
 */

import React from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { Button } from '@/shared/components/ui';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SetupCompleteProps {
  onNext: () => void;
}

const SetupComplete = ({ onNext }: SetupCompleteProps) => {
  const { enterprise } = useEnterprise();
  
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-success-100 p-3">
          <CheckCircle className="h-12 w-12 text-success-600" />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold text-primary-900">Setup Complete!</h2>
        <p className="text-neutral-500 mt-1">
          Your business information has been saved successfully.
        </p>
      </div>
      
      <div className="bg-primary-50 rounded-lg p-4 text-left">
        <h3 className="font-medium text-primary-800 mb-2">Business Summary</h3>
        <ul className="space-y-1 text-primary-700 text-sm">
          <li><span className="font-medium">Name:</span> {enterprise.businessInfo.name}</li>
          <li><span className="font-medium">Location:</span> {enterprise.businessInfo.city}, {enterprise.businessInfo.country}</li>
          <li><span className="font-medium">Contact:</span> {enterprise.businessInfo.email}</li>
          <li><span className="font-medium">Currency:</span> {enterprise.settings.currency.name}</li>
          <li><span className="font-medium">Tax Settings:</span> {enterprise.taxSettings.taxes.filter(tax => tax.enabled).length} active tax(es)</li>
        </ul>
      </div>
      
      <div className="pt-4">
        <Button
          type="button"
          onClick={onNext}
          rightIcon={<ArrowRight size={16} />}
        >
          Go to Dashboard
        </Button>
        <p className="text-xs text-neutral-500 mt-4">
          You can edit these settings anytime from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default SetupComplete;