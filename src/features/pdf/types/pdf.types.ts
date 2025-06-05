/**
 * PDF feature type definitions
 */

import { InvoiceState } from '@/features/invoice/types/invoice.types';

export type PDFTemplate = 'standard' | 'professional' | 'minimal';

export interface PDFOptions {
  template: PDFTemplate;
  orientation: 'portrait' | 'landscape';
  pageSize: 'a4' | 'letter' | 'legal';
  fileName: string;
  compress: boolean;
  includeHeader: boolean;
  includeFooter: boolean;
  includeSignature: boolean;
}

export interface PDFResult {
  blob: Blob;
  url: string;
  fileName: string;
}

export interface PDFContextType {
  generatePDF: (invoice: InvoiceState, options?: Partial<PDFOptions>) => Promise<PDFResult>;
  lastGeneratedPDF: PDFResult | null;
  options: PDFOptions;
  updateOptions: (options: Partial<PDFOptions>) => void;
  previewMode: boolean;
  togglePreviewMode: () => void;
  isGenerating: boolean;
  error: Error | null;
}

export interface PDFGenerationError extends Error {
  code: string;
  details?: unknown;
}