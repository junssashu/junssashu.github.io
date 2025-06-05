/**
 * Storage-related constants used for browser storage
 */

import { StorageKey } from '../types/common.types';

export const STORAGE_PREFIX = 'pdf-receipt-generator';

export const STORAGE_KEYS: Record<StorageKey, string> = {
  enterprise: `${STORAGE_PREFIX}_enterprise`,
  templates: `${STORAGE_PREFIX}_templates`,
  currentInvoice: `${STORAGE_PREFIX}_current_invoice`,
  pdfCache: `${STORAGE_PREFIX}_pdf_cache`,
  preferences: `${STORAGE_PREFIX}_preferences`,
};

export const STORAGE_LIMITS = {
  enterprise: 2048, // 2KB
  templates: 3072, // 3KB  
  currentInvoice: 1024, // 1KB
  pdfCache: 512, // 0.5KB
  total: 6656, // 6.5KB
};

export const LOGO_CONSTRAINTS = {
  maxWidth: 200,
  maxHeight: 200,
  maxSizeKB: 1, // 1KB
  format: 'image/jpeg',
};

export const TEMPLATE_LIMITS = {
  maxTemplates: 10,
};