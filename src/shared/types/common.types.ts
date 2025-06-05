/**
 * Common type definitions used throughout the application
 */

export interface EntityBase {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Timestamps {
  createdAt: string;
  updatedAt: string;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T | null;
  status: Status;
  error: Error | null;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
};

export type TaxType = 'percentage' | 'fixed';

export type TaxConfig = {
  id: string;
  name: string;
  rate: number;
  type: TaxType;
  enabled: boolean;
};

export type Theme = 'light' | 'dark' | 'system';

export type StorageKey = 
  | 'enterprise'
  | 'templates'
  | 'currentInvoice'
  | 'pdfCache'
  | 'preferences';