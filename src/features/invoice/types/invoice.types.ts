/**
 * Invoice type definitions
 */

import { EntityBase } from '@/shared/types/common.types';
import { Product, ProductTotals } from './product.types';
import { BusinessInfo } from '@/features/enterprise/types/enterprise.types';

export interface Customer {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  taxNumber?: string;
}

export interface InvoiceTotals {
  subtotal: number;
  totalDiscount: number;
  totalTaxableAmount: number;
  totalTax: number;
  grandTotal: number;
  productTotals: Record<string, ProductTotals>;
}

export interface InvoiceSettings {
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  notes?: string;
  terms?: string;
  showDiscounts: boolean;
  showTaxes: boolean;
}

export interface InvoiceState {
  products: Product[];
  customer?: Customer;
  totals: InvoiceTotals;
  settings: InvoiceSettings;
  business?: BusinessInfo; // Copy of business info from enterprise
  logo?: string; // Copy of logo from enterprise
  status: 'draft' | 'final';
}

export interface InvoiceContextType {
  invoice: InvoiceState;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  removeProduct: (id: string) => void;
  updateCustomer: (customer: Customer) => void;
  updateSettings: (settings: Partial<InvoiceSettings>) => void;
  calculateTotals: () => void;
  resetInvoice: () => void;
  finalizeInvoice: () => void;
  isDirty: boolean;
  hasProducts: boolean;
}