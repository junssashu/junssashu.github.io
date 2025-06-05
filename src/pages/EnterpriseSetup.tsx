/**
 * EnterpriseSetup page component
 * Handles initial business setup wizard
 */

import React, { useState } from 'react';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { EnterpriseWizardStep } from '@/features/enterprise/types/enterprise.types';
import { 
  BusinessInfoForm,
  LogoUploader,
  TaxConfigurationForm,
  PreferencesForm,
  SetupComplete
} from '@/features/enterprise/components';

const EnterpriseSetup = () => {
  const { enterprise, isInitialized } = useEnterprise();
  const [currentStep, setCurrentStep] = useState<EnterpriseWizardStep>('business-info');
  
  // If already initialized, redirect to dashboard
  React.useEffect(() => {
    if (isInitialized) {
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [isInitialized]);
  
  // Navigate to next step
  const nextStep = () => {
    switch (currentStep) {
      case 'business-info':
        setCurrentStep('logo-upload');
        break;
      case 'logo-upload':
        setCurrentStep('tax-settings');
        break;
      case 'tax-settings':
        setCurrentStep('preferences');
        break;
      case 'preferences':
        setCurrentStep('complete');
        break;
      case 'complete':
        // Navigate to dashboard
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
        break;
      default:
        setCurrentStep('business-info');
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    switch (currentStep) {
      case 'logo-upload':
        setCurrentStep('business-info');
        break;
      case 'tax-settings':
        setCurrentStep('logo-upload');
        break;
      case 'preferences':
        setCurrentStep('tax-settings');
        break;
      case 'complete':
        setCurrentStep('preferences');
        break;
      default:
        setCurrentStep('business-info');
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'business-info':
        return <BusinessInfoForm onNext={nextStep} />;
      case 'logo-upload':
        return <LogoUploader onNext={nextStep} onBack={prevStep} />;
      case 'tax-settings':
        return <TaxConfigurationForm onNext={nextStep} onBack={prevStep} />;
      case 'preferences':
        return <PreferencesForm onNext={nextStep} onBack={prevStep} />;
      case 'complete':
        return <SetupComplete onNext={nextStep} />;
      default:
        return <BusinessInfoForm onNext={nextStep} />;
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="w-full max-w-2xl p-4">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-accent-600 p-6 text-white">
            <h1 className="text-2xl font-bold">Business Setup</h1>
            <p className="text-accent-100 mt-1">Set up your business details for your invoices</p>
          </div>
          
          {/* Progress indicator */}
          <div className="px-6 pt-6">
            <div className="flex justify-between mb-2">
              <div className="text-xs text-primary-500 font-medium">
                Step {getStepNumber(currentStep)} of 5
              </div>
              <div className="text-xs text-primary-500 font-medium">
                {getStepLabel(currentStep)}
              </div>
            </div>
            <div className="w-full bg-primary-100 rounded-full h-2">
              <div 
                className="bg-accent-500 h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${(getStepNumber(currentStep) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Step content */}
          <div className="p-6">
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get step number
const getStepNumber = (step: EnterpriseWizardStep): number => {
  switch (step) {
    case 'business-info': return 1;
    case 'logo-upload': return 2;
    case 'tax-settings': return 3;
    case 'preferences': return 4;
    case 'complete': return 5;
    default: return 1;
  }
};

// Helper to get step label
const getStepLabel = (step: EnterpriseWizardStep): string => {
  switch (step) {
    case 'business-info': return 'Business Information';
    case 'logo-upload': return 'Logo';
    case 'tax-settings': return 'Tax Settings';
    case 'preferences': return 'Preferences';
    case 'complete': return 'Complete';
    default: return 'Business Information';
  }
};

export default EnterpriseSetup;