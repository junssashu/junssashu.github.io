/**
 * Enterprise context provider
 * Manages enterprise state including business info, settings, and logo
 */

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  EnterpriseContextType, 
  EnterpriseState, 
  BusinessInfo, 
  EnterpriseSettings, 
  EnterpriseTaxSettings 
} from '../types/enterprise.types';
import { loadEnterpriseData, saveEnterpriseData, updateEnterpriseLogo, resetEnterpriseData } from '../services/enterpriseStorage';
import { useStorage } from '@/shared/hooks/useStorage';

// Create context with default values
const EnterpriseContext = createContext<EnterpriseContextType | undefined>(undefined);

export const EnterpriseProvider = ({ children }: { children: ReactNode }) => {
  // Get enterprise data from storage
  const { 
    value: enterpriseData, 
    setValue: setEnterpriseData,
    sizeInfo
  } = useStorage<EnterpriseState>('enterprise', loadEnterpriseData());
  
  // Extract size information
  const storageInfo = {
    size: sizeInfo.size,
    percentUsed: sizeInfo.percentUsed,
    isApproachingLimit: sizeInfo.isApproachingLimit,
    isAtLimit: sizeInfo.isAtLimit,
  };
  
  // Check if enterprise is initialized
  const isInitialized = enterpriseData.initialized;
  
  // Initialize enterprise data if not already done
  useEffect(() => {
    if (!isInitialized && window.location.pathname !== '/setup') {
      // Redirect to setup if not initialized
      window.history.pushState({}, '', '/setup');
      window.dispatchEvent(new Event('popstate'));
    }
  }, [isInitialized]);
  
  // Update business info
  const updateBusinessInfo = (info: Partial<BusinessInfo>) => {
    setEnterpriseData(prev => {
      const updated = {
        ...prev,
        businessInfo: {
          ...prev.businessInfo,
          ...info,
        },
        initialized: true,
      };
      
      return updated;
    });
  };
  
  // Update enterprise settings
  const updateSettings = (settings: Partial<EnterpriseSettings>) => {
    setEnterpriseData(prev => {
      const updated = {
        ...prev,
        settings: {
          ...prev.settings,
          ...settings,
        },
        initialized: true,
      };
      
      return updated;
    });
  };
  
  // Update tax settings
  const updateTaxSettings = (taxSettings: Partial<EnterpriseTaxSettings>) => {
    setEnterpriseData(prev => {
      const updated = {
        ...prev,
        taxSettings: {
          ...prev.taxSettings,
          ...taxSettings,
        },
        initialized: true,
      };
      
      return updated;
    });
  };
  
  // Update logo
  const updateLogo = async (logo: string | undefined) => {
    try {
      const updatedState = await updateEnterpriseLogo(enterpriseData, logo);
      setEnterpriseData(updatedState);
    } catch (error) {
      console.error('Error updating logo:', error);
    }
  };
  
  // Reset enterprise
  const resetEnterprise = () => {
    if (resetEnterpriseData()) {
      setEnterpriseData(loadEnterpriseData());
    }
  };
  
  // Context value
  const value: EnterpriseContextType = {
    enterprise: enterpriseData,
    isInitialized,
    updateBusinessInfo,
    updateSettings,
    updateTaxSettings,
    updateLogo,
    resetEnterprise,
    storageInfo,
  };
  
  return (
    <EnterpriseContext.Provider value={value}>
      {children}
    </EnterpriseContext.Provider>
  );
};

// Custom hook for accessing enterprise context
export const useEnterprise = (): EnterpriseContextType => {
  const context = useContext(EnterpriseContext);
  
  if (context === undefined) {
    throw new Error('useEnterprise must be used within an EnterpriseProvider');
  }
  
  return context;
};