/**
 * PDF context provider
 * Manages PDF generation state and options
 */

import { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_PDF_OPTIONS, generatePDF } from '../services/pdfGenerator';
import { PDFContextType, PDFOptions, PDFResult } from '../types/pdf.types';
import { InvoiceState } from '@/features/invoice/types/invoice.types';

// Create context
const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const PDFProvider = ({ children }: { children: ReactNode }) => {
  // Last generated PDF
  const [lastGeneratedPDF, setLastGeneratedPDF] = useState<PDFResult | null>(null);
  
  // PDF options
  const [options, setOptions] = useState<PDFOptions>(DEFAULT_PDF_OPTIONS);
  
  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  
  // Loading and error states
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Generate PDF
  const handleGeneratePDF = async (
    invoice: InvoiceState,
    customOptions?: Partial<PDFOptions>
  ): Promise<PDFResult> => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Merge default options with custom options
      const mergedOptions: PDFOptions = {
        ...options,
        ...customOptions,
        // Set filename from invoice number if not specified
        fileName: customOptions?.fileName || `invoice-${invoice.settings.invoiceNumber}.pdf`,
      };
      
      // Generate PDF
      const result = await generatePDF(invoice, mergedOptions);
      
      // Cache the result
      setLastGeneratedPDF(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate PDF');
      setError(error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Update options
  const updateOptions = (newOptions: Partial<PDFOptions>) => {
    setOptions(prev => ({
      ...prev,
      ...newOptions,
    }));
  };
  
  // Toggle preview mode
  const togglePreviewMode = () => {
    setPreviewMode(prev => !prev);
  };
  
  // Context value
  const value: PDFContextType = {
    generatePDF: handleGeneratePDF,
    lastGeneratedPDF,
    options,
    updateOptions,
    previewMode,
    togglePreviewMode,
    isGenerating,
    error,
  };
  
  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
};

// Custom hook to use PDF context
export const usePDF = (): PDFContextType => {
  const context = useContext(PDFContext);
  
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  
  return context;
};