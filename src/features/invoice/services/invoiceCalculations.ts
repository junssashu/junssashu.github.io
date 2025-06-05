/**
 * Invoice calculation service
 * Handles all calculations for invoice totals
 */

import { Product, ProductTotals } from '../types/product.types';
import { InvoiceTotals } from '../types/invoice.types';
import { TaxConfig } from '@/shared/types/common.types';

/**
 * Calculates totals for a single product
 */
export const calculateProductTotals = (
  product: Product,
  taxes: TaxConfig[]
): ProductTotals => {
  // Basic subtotal
  const subtotal = product.quantity * product.price;
  
  // Calculate discount
  let discountAmount = 0;
  if (product.discount && product.discount > 0) {
    if (product.discountType === 'percentage') {
      discountAmount = subtotal * (product.discount / 100);
    } else {
      // Fixed discount cannot exceed subtotal
      discountAmount = Math.min(product.discount, subtotal);
    }
  }
  
  // Taxable amount (subtotal - discount)
  const taxableAmount = subtotal - discountAmount;
  
  // Calculate tax if applicable
  let taxAmount = 0;
  if (product.taxId) {
    const tax = taxes.find(t => t.id === product.taxId);
    if (tax && tax.enabled) {
      if (tax.type === 'percentage') {
        taxAmount = taxableAmount * (tax.rate / 100);
      } else {
        taxAmount = tax.rate;
      }
    }
  }
  
  // Total = subtotal - discount + tax (if tax not included)
  // If tax is included, total = subtotal
  const total = product.taxIncluded 
    ? subtotal
    : taxableAmount + taxAmount;
  
  return {
    subtotal,
    discountAmount,
    taxableAmount,
    taxAmount,
    total
  };
};

/**
 * Calculates totals for entire invoice
 */
export const calculateInvoiceTotals = (
  products: Product[],
  taxes: TaxConfig[]
): InvoiceTotals => {
  // Initialize totals
  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxableAmount = 0;
  let totalTax = 0;
  let grandTotal = 0;
  
  // Calculate totals for each product
  const productTotals: Record<string, ProductTotals> = {};
  
  products.forEach(product => {
    const totals = calculateProductTotals(product, taxes);
    productTotals[product.id] = totals;
    
    subtotal += totals.subtotal;
    totalDiscount += totals.discountAmount;
    totalTaxableAmount += totals.taxableAmount;
    totalTax += totals.taxAmount;
    grandTotal += totals.total;
  });
  
  return {
    subtotal,
    totalDiscount,
    totalTaxableAmount,
    totalTax,
    grandTotal,
    productTotals
  };
};

/**
 * Formats a currency value according to locale and currency settings
 */
export const formatCurrency = (
  value: number,
  currencyCode: string,
  decimals: number
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};