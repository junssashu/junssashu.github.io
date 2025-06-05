/**
 * Product type definitions for invoice feature
 */

export interface Product {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxId?: string;
  taxIncluded?: boolean;
}

export interface ProductTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}

export interface ProductFormData {
  name: string;
  description?: string;
  quantity: number;
  price: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  taxId?: string;
  taxIncluded?: boolean;
}

export interface ProductFilters {
  search?: string;
  sortBy?: 'name' | 'price' | 'quantity' | 'total';
  sortDirection?: 'asc' | 'desc';
}