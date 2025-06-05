/**
 * Invoice context provider
 * Manages invoice state including products, customer info, and calculations
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceState, InvoiceContextType, Customer, InvoiceSettings } from '../types/invoice.types';
import { Product } from '../types/product.types';
import { calculateInvoiceTotals } from '../services/invoiceCalculations';
import { useStorage } from '@/shared/hooks/useStorage';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';

// Default invoice settings
const getDefaultInvoiceSettings = (): InvoiceSettings => ({
  invoiceNumber: '',
  issueDate: new Date().toISOString().split('T')[0],
  currency: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    decimals: 2,
  },
  showDiscounts: true,
  showTaxes: true,
});

// Default invoice state
const getDefaultInvoiceState = (): InvoiceState => ({
  products: [],
  totals: {
    subtotal: 0,
    totalDiscount: 0,
    totalTaxableAmount: 0,
    totalTax: 0,
    grandTotal: 0,
    productTotals: {},
  },
  settings: getDefaultInvoiceSettings(),
  status: 'draft',
});

// Create context
const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider = ({ children }: { children: ReactNode }) => {
  const { enterprise } = useEnterprise();
  
  // Initialize invoice state from storage or defaults
  const { value: invoiceData, setValue: setInvoiceData } = useStorage<InvoiceState>(
    'currentInvoice',
    getDefaultInvoiceState()
  );
  
  // Track if invoice has been modified
  const [isDirty, setIsDirty] = useState(false);
  
  // Sync with enterprise data when it changes
  useEffect(() => {
    if (enterprise.initialized) {
      setInvoiceData(prev => ({
        ...prev,
        business: enterprise.businessInfo,
        logo: enterprise.logo,
        settings: {
          ...prev.settings,
          currency: enterprise.settings.currency,
          invoiceNumber: `${enterprise.settings.invoiceNumberPrefix}${enterprise.settings.nextInvoiceNumber}`,
        },
      }));
    }
  }, [enterprise, setInvoiceData]);
  
  // Calculate totals whenever products change
  useEffect(() => {
    if (invoiceData.products.length > 0) {
      calculateTotals();
    }
  }, [invoiceData.products]);
  
  // Add a new product to the invoice
  const addProduct = (product: Product) => {
    const newProduct = {
      ...product,
      id: product.id || uuidv4(),
    };
    
    setInvoiceData(prev => ({
      ...prev,
      products: [...prev.products, newProduct],
    }));
    
    setIsDirty(true);
  };
  
  // Update an existing product
  const updateProduct = (id: string, updates: Partial<Product>) => {
    setInvoiceData(prev => ({
      ...prev,
      products: prev.products.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
    
    setIsDirty(true);
  };
  
  // Remove a product
  const removeProduct = (id: string) => {
    setInvoiceData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id),
    }));
    
    setIsDirty(true);
  };
  
  // Update customer information
  const updateCustomer = (customer: Customer) => {
    setInvoiceData(prev => ({
      ...prev,
      customer,
    }));
    
    setIsDirty(true);
  };
  
  // Update invoice settings
  const updateSettings = (settings: Partial<InvoiceSettings>) => {
    setInvoiceData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings,
      },
    }));
    
    setIsDirty(true);
  };
  
  // Calculate invoice totals
  const calculateTotals = () => {
    const totals = calculateInvoiceTotals(
      invoiceData.products,
      enterprise.taxSettings.taxes
    );
    
    setInvoiceData(prev => ({
      ...prev,
      totals,
    }));
  };
  
  // Reset invoice to defaults
  const resetInvoice = () => {
    setInvoiceData({
      ...getDefaultInvoiceState(),
      business: enterprise.businessInfo,
      logo: enterprise.logo,
      settings: {
        ...getDefaultInvoiceSettings(),
        currency: enterprise.settings.currency,
        invoiceNumber: `${enterprise.settings.invoiceNumberPrefix}${enterprise.settings.nextInvoiceNumber}`,
      },
    });
    
    setIsDirty(false);
  };
  
  // Finalize invoice (changes status from draft to final)
  const finalizeInvoice = () => {
    setInvoiceData(prev => ({
      ...prev,
      status: 'final',
    }));
    
    // Would normally increment invoice number in enterprise settings
    setIsDirty(false);
  };
  
  // Context value
  const value: InvoiceContextType = {
    invoice: invoiceData,
    addProduct,
    updateProduct,
    removeProduct,
    updateCustomer,
    updateSettings,
    calculateTotals,
    resetInvoice,
    finalizeInvoice,
    isDirty,
    hasProducts: invoiceData.products.length > 0,
  };
  
  return (
    <InvoiceContext.Provider value={value}>
      {children}
    </InvoiceContext.Provider>
  );
};

// Custom hook to use invoice context
export const useInvoice = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  
  return context;
};