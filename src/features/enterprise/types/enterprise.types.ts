/**
 * Enterprise feature type definitions
 */

import { TaxConfig, Currency } from '@/types/common.types';

export interface BusinessInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxNumber?: string;
  registrationNumber?: string;
}

export interface EnterpriseSettings {
  currency: Currency;
  dateFormat: string;
  invoiceNumberPrefix: string;
  nextInvoiceNumber: number;
  showLogo: boolean;
  brandColor?: string;
}

export interface EnterpriseTaxSettings {
  taxes: TaxConfig[];
  defaultTax?: string; // ID of default tax
}

export interface EnterpriseState {
  initialized: boolean;
  businessInfo: BusinessInfo;
  settings: EnterpriseSettings;
  taxSettings: EnterpriseTaxSettings;
  logo?: string; // base64 encoded logo
}

export interface EnterpriseContextType {
  enterprise: EnterpriseState;
  isInitialized: boolean;
  updateBusinessInfo: (info: Partial<BusinessInfo>) => void;
  updateSettings: (settings: Partial<EnterpriseSettings>) => void;
  updateTaxSettings: (taxSettings: Partial<EnterpriseTaxSettings>) => void;
  updateLogo: (logo: string | undefined) => void;
  resetEnterprise: () => void;
  storageInfo: {
    size: number;
    percentUsed: number;
    isApproachingLimit: boolean;
    isAtLimit: boolean;
  };
}

export type EnterpriseWizardStep = 
  | 'business-info'
  | 'logo-upload'
  | 'tax-settings'
  | 'preferences'
  | 'complete';