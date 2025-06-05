/**
 * Enterprise storage service
 * Handles saving and retrieving enterprise data
 */

import { getFromStorage, saveToStorage } from '@/shared/services/storageService';
import { EnterpriseState } from '../types/enterprise.types';
import { extractDominantColor } from './logoProcessor';

// Default currency data
const DEFAULT_CURRENCY = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  decimals: 2,
};

// Default enterprise state
const DEFAULT_ENTERPRISE_STATE: EnterpriseState = {
  initialized: false,
  businessInfo: {
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    email: '',
    website: '',
  },
  settings: {
    currency: DEFAULT_CURRENCY,
    dateFormat: 'MM/dd/yyyy',
    invoiceNumberPrefix: 'INV-',
    nextInvoiceNumber: 1001,
    showLogo: true,
  },
  taxSettings: {
    taxes: [
      {
        id: 'tax-1',
        name: 'Tax',
        rate: 0,
        type: 'percentage',
        enabled: false,
      },
    ],
    defaultTax: 'tax-1',
  },
};

/**
 * Loads enterprise data from storage
 */
export const loadEnterpriseData = (): EnterpriseState => {
  const data = getFromStorage<EnterpriseState>('enterprise');
  return data || DEFAULT_ENTERPRISE_STATE;
};

/**
 * Saves enterprise data to storage
 */
export const saveEnterpriseData = (data: EnterpriseState): boolean => {
  return saveToStorage('enterprise', data);
};

/**
 * Updates enterprise logo and extracts brand color
 */
export const updateEnterpriseLogo = async (
  currentState: EnterpriseState,
  logoDataUrl?: string
): Promise<EnterpriseState> => {
  // If logo is provided, extract color
  let brandColor = currentState.settings.brandColor;
  
  if (logoDataUrl) {
    try {
      brandColor = await extractDominantColor(logoDataUrl);
    } catch (error) {
      console.error('Error extracting color from logo:', error);
    }
  }
  
  // Update state with new logo and brand color
  const updatedState: EnterpriseState = {
    ...currentState,
    logo: logoDataUrl,
    settings: {
      ...currentState.settings,
      brandColor,
    },
  };
  
  // Save updated state
  saveEnterpriseData(updatedState);
  
  return updatedState;
};

/**
 * Resets enterprise data to defaults
 */
export const resetEnterpriseData = (): boolean => {
  return saveEnterpriseData(DEFAULT_ENTERPRISE_STATE);
};