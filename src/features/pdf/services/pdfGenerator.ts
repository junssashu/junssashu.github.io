/**
 * PDF Generation service
 * Handles the creation of PDF invoices
 */

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { InvoiceState } from '@/features/invoice/types/invoice.types';
import { PDFOptions, PDFResult, PDFTemplate } from '../types/pdf.types';

// Default PDF generation options
export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  template: 'standard',
  orientation: 'portrait',
  pageSize: 'a4',
  fileName: 'invoice.pdf',
  compress: true,
  includeHeader: true,
  includeFooter: true,
  includeSignature: false,
};

/**
 * Generates a PDF from an invoice using HTML templates
 */
export const generatePDF = async (
  invoice: InvoiceState,
  options: PDFOptions = DEFAULT_PDF_OPTIONS
): Promise<PDFResult> => {
  try {
    // Create a container for the invoice template
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);
    
    // Render the template based on the options
    renderTemplate(container, invoice, options.template);
    
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Higher scale for better quality
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    // Clean up the container
    document.body.removeChild(container);
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: options.orientation,
      unit: 'mm',
      format: options.pageSize,
      compress: options.compress,
    });
    
    // Add canvas image to PDF
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    const imgWidth = pdfWidth;
    const imgHeight = pdfWidth / ratio;
    
    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    
    // Handle multi-page if needed
    if (imgHeight > pdfHeight) {
      let remainingHeight = imgHeight;
      let currentPosition = 0;
      
      while (remainingHeight > 0) {
        currentPosition += pdfHeight;
        remainingHeight -= pdfHeight;
        
        if (remainingHeight > 0) {
          pdf.addPage();
          pdf.addImage(
            imgData, 
            'JPEG', 
            0, 
            -currentPosition, 
            imgWidth, 
            imgHeight
          );
        }
      }
    }
    
    // Generate blob
    const blob = pdf.output('blob');
    
    // Create object URL
    const url = URL.createObjectURL(blob);
    
    // Generate file name
    const fileName = options.fileName || `invoice-${invoice.settings.invoiceNumber}.pdf`;
    
    // Return PDF result
    return {
      blob,
      url,
      fileName,
    };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Renders the appropriate template into a container
 */
const renderTemplate = (
  container: HTMLDivElement,
  invoice: InvoiceState,
  template: PDFTemplate
) => {
  // Create template based on selected type
  let templateHTML = '';
  
  switch (template) {
    case 'professional':
      templateHTML = getProfessionalTemplate(invoice);
      break;
    case 'minimal':
      templateHTML = getMinimalTemplate(invoice);
      break;
    case 'standard':
    default:
      templateHTML = getStandardTemplate(invoice);
  }
  
  // Set the HTML content
  container.innerHTML = templateHTML;
};

/**
 * Standard invoice template
 */
const getStandardTemplate = (invoice: InvoiceState): string => {
  const { business, customer, products, totals, settings, logo } = invoice;
  
  if (!business) {
    throw new Error('Business information is required');
  }
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency.code,
      minimumFractionDigits: settings.currency.decimals,
      maximumFractionDigits: settings.currency.decimals,
    }).format(amount);
  };
  
  // Generate products HTML
  const productsHTML = products.map(product => {
    const productTotal = totals.productTotals[product.id];
    return `
      <tr>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${formatAmount(product.price)}</td>
        ${settings.showDiscounts ? `<td>${product.discount ? (product.discountType === 'percentage' ? `${product.discount}%` : formatAmount(product.discount)) : '-'}</td>` : ''}
        ${settings.showTaxes ? `<td>${productTotal?.taxAmount ? formatAmount(productTotal.taxAmount) : '-'}</td>` : ''}
        <td>${formatAmount(productTotal?.total || 0)}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1e293b;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div>
          ${logo ? `<img src="${logo}" alt="Business Logo" style="max-width: 150px; max-height: 100px;" />` : ''}
          <h1 style="color: #1e293b; margin-top: ${logo ? '10px' : '0'}; margin-bottom: 5px; font-size: 24px;">${business.name}</h1>
          <div style="color: #475569; font-size: 14px;">
            <div>${business.address}</div>
            <div>${business.city}, ${business.state} ${business.zip}</div>
            <div>${business.country}</div>
            <div>${business.phone}</div>
            <div>${business.email}</div>
            ${business.website ? `<div>${business.website}</div>` : ''}
            ${business.taxNumber ? `<div>Tax ID: ${business.taxNumber}</div>` : ''}
          </div>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 28px; color: #0ea5e9; margin-top: 0; margin-bottom: 5px;">INVOICE</h2>
          <div style="font-size: 16px; margin-bottom: 15px;">
            <div><strong>Invoice #:</strong> ${settings.invoiceNumber}</div>
            <div><strong>Date:</strong> ${new Date(settings.issueDate).toLocaleDateString()}</div>
            ${settings.dueDate ? `<div><strong>Due Date:</strong> ${new Date(settings.dueDate).toLocaleDateString()}</div>` : ''}
          </div>
        </div>
      </div>
      
      <!-- Client Information -->
      ${customer ? `
        <div style="margin-bottom: 30px;">
          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 10px;">Client Information</h3>
          <div style="color: #475569; font-size: 14px;">
            <div><strong>${customer.name}</strong></div>
            ${customer.address ? `<div>${customer.address}</div>` : ''}
            ${customer.city ? `<div>${customer.city}${customer.state ? `, ${customer.state}` : ''}${customer.zip ? ` ${customer.zip}` : ''}</div>` : ''}
            ${customer.country ? `<div>${customer.country}</div>` : ''}
            ${customer.phone ? `<div>${customer.phone}</div>` : ''}
            ${customer.email ? `<div>${customer.email}</div>` : ''}
            ${customer.taxNumber ? `<div>Tax ID: ${customer.taxNumber}</div>` : ''}
          </div>
        </div>
      ` : ''}
      
      <!-- Products Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f1f5f9; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Description</th>
            <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Qty</th>
            <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Price</th>
            ${settings.showDiscounts ? `<th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Discount</th>` : ''}
            ${settings.showTaxes ? `<th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Tax</th>` : ''}
            <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 30px;">
        <div style="width: 300px; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <div>Subtotal:</div>
            <div>${formatAmount(totals.subtotal)}</div>
          </div>
          
          ${totals.totalDiscount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Discount:</div>
              <div>-${formatAmount(totals.totalDiscount)}</div>
            </div>
          ` : ''}
          
          ${totals.totalTax > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Tax:</div>
              <div>${formatAmount(totals.totalTax)}</div>
            </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 16px; border-top: 1px solid #e2e8f0; padding-top: 5px; margin-top: 5px;">
            <div>Total:</div>
            <div>${formatAmount(totals.grandTotal)}</div>
          </div>
        </div>
      </div>
      
      <!-- Notes and Terms -->
      ${settings.notes ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 5px;">Notes</h3>
          <div style="color: #475569; font-size: 14px; border-left: 4px solid #e2e8f0; padding-left: 10px;">
            ${settings.notes}
          </div>
        </div>
      ` : ''}
      
      ${settings.terms ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 5px;">Terms & Conditions</h3>
          <div style="color: #475569; font-size: 14px;">
            ${settings.terms}
          </div>
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
        <p>Thank you for your business!</p>
        ${business.website ? `<p>${business.website}</p>` : ''}
      </div>
    </div>
  `;
};

/**
 * Professional invoice template
 */
const getProfessionalTemplate = (invoice: InvoiceState): string => {
  const { business, customer, products, totals, settings, logo } = invoice;
  
  if (!business) {
    throw new Error('Business information is required');
  }
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency.code,
      minimumFractionDigits: settings.currency.decimals,
      maximumFractionDigits: settings.currency.decimals,
    }).format(amount);
  };
  
  // Generate products HTML
  const productsHTML = products.map((product, index) => {
    const productTotal = totals.productTotals[product.id];
    const isEven = index % 2 === 0;
    return `
      <tr style="background-color: ${isEven ? '#f8fafc' : 'white'};">
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${product.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${product.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatAmount(product.price)}</td>
        ${settings.showDiscounts ? `<td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${product.discount ? (product.discountType === 'percentage' ? `${product.discount}%` : formatAmount(product.discount)) : '-'}</td>` : ''}
        ${settings.showTaxes ? `<td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${productTotal?.taxAmount ? formatAmount(productTotal.taxAmount) : '-'}</td>` : ''}
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 500;">${formatAmount(productTotal?.total || 0)}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 0; color: #1e293b; background-color: white;">
      <!-- Header Banner -->
      <div style="background-color: #0ea5e9; color: white; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          ${logo ? `<img src="${logo}" alt="Business Logo" style="max-width: 120px; max-height: 80px; background-color: white; padding: 8px; border-radius: 4px;" />` : ''}
          <h1 style="margin-top: ${logo ? '10px' : '0'}; margin-bottom: 0; font-size: 28px;">${business.name}</h1>
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 32px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">INVOICE</h2>
          <div style="font-size: 18px; margin-top: 10px; opacity: 0.9;">
            #${settings.invoiceNumber}
          </div>
        </div>
      </div>
      
      <!-- Info Section -->
      <div style="display: flex; justify-content: space-between; padding: 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
        <!-- Business Information -->
        <div style="flex: 1;">
          <h3 style="color: #0ea5e9; font-size: 16px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">From</h3>
          <div style="color: #475569; font-size: 14px;">
            <div style="font-weight: bold; color: #1e293b; margin-bottom: 5px;">${business.name}</div>
            <div>${business.address}</div>
            <div>${business.city}, ${business.state} ${business.zip}</div>
            <div>${business.country}</div>
            <div style="margin-top: 10px;">
              <div>${business.phone}</div>
              <div>${business.email}</div>
              ${business.website ? `<div>${business.website}</div>` : ''}
              ${business.taxNumber ? `<div style="margin-top: 5px;">Tax ID: ${business.taxNumber}</div>` : ''}
            </div>
          </div>
        </div>
        
        <!-- Client Information -->
        <div style="flex: 1;">
          <h3 style="color: #0ea5e9; font-size: 16px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">To</h3>
          <div style="color: #475569; font-size: 14px;">
            ${customer ? `
              <div style="font-weight: bold; color: #1e293b; margin-bottom: 5px;">${customer.name}</div>
              ${customer.address ? `<div>${customer.address}</div>` : ''}
              ${customer.city ? `<div>${customer.city}${customer.state ? `, ${customer.state}` : ''}${customer.zip ? ` ${customer.zip}` : ''}</div>` : ''}
              ${customer.country ? `<div>${customer.country}</div>` : ''}
              ${customer.phone || customer.email ? `
                <div style="margin-top: 10px;">
                  ${customer.phone ? `<div>${customer.phone}</div>` : ''}
                  ${customer.email ? `<div>${customer.email}</div>` : ''}
                </div>
              ` : ''}
              ${customer.taxNumber ? `<div style="margin-top: 5px;">Tax ID: ${customer.taxNumber}</div>` : ''}
            ` : '<div style="color: #94a3b8;">No client information provided</div>'}
          </div>
        </div>
        
        <!-- Invoice Details -->
        <div style="flex: 1; text-align: right;">
          <h3 style="color: #0ea5e9; font-size: 16px; margin-top: 0; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Details</h3>
          <div style="color: #475569; font-size: 14px;">
            <div style="margin-bottom: 5px;">
              <span style="font-weight: 500; color: #1e293b;">Invoice Date:</span>
              <span style="margin-left: 10px;">${new Date(settings.issueDate).toLocaleDateString()}</span>
            </div>
            ${settings.dueDate ? `
              <div style="margin-bottom: 5px;">
                <span style="font-weight: 500; color: #1e293b;">Due Date:</span>
                <span style="margin-left: 10px;">${new Date(settings.dueDate).toLocaleDateString()}</span>
              </div>
            ` : ''}
            <div style="margin-bottom: 5px; margin-top: ${settings.dueDate ? '0' : '5px'};">
              <span style="font-weight: 500; color: #1e293b;">Currency:</span>
              <span style="margin-left: 10px;">${settings.currency.name}</span>
            </div>
            <div style="margin-top: 20px; background-color: #0ea5e9; color: white; padding: 10px 15px; display: inline-block; border-radius: 4px;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Amount Due</div>
              <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">${formatAmount(totals.grandTotal)}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Products Table -->
      <div style="padding: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f1f5f9; text-align: left; color: #1e293b;">
              <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0;">Description</th>
              <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-align: center;">Qty</th>
              <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-align: right;">Price</th>
              ${settings.showDiscounts ? `<th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-align: right;">Discount</th>` : ''}
              ${settings.showTaxes ? `<th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-align: right;">Tax</th>` : ''}
              <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${productsHTML}
          </tbody>
        </table>
      </div>
      
      <!-- Totals -->
      <div style="padding: 0 30px 30px; display: flex; justify-content: flex-end;">
        <div style="width: 300px; font-size: 14px; background-color: #f8fafc; border-radius: 8px; padding: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #64748b;">Subtotal:</div>
            <div style="font-weight: 500;">${formatAmount(totals.subtotal)}</div>
          </div>
          
          ${totals.totalDiscount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <div style="color: #64748b;">Discount:</div>
              <div style="font-weight: 500;">-${formatAmount(totals.totalDiscount)}</div>
            </div>
          ` : ''}
          
          ${totals.totalTax > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <div style="color: #64748b;">Tax:</div>
              <div style="font-weight: 500;">${formatAmount(totals.totalTax)}</div>
            </div>
          ` : ''}
          
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px; color: #0ea5e9;">
            <div>Total:</div>
            <div>${formatAmount(totals.grandTotal)}</div>
          </div>
        </div>
      </div>
      
      <!-- Notes and Terms -->
      ${settings.notes || settings.terms ? `
        <div style="padding: 0 30px 30px;">
          ${settings.notes ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 8px;">Notes</h3>
              <div style="color: #475569; font-size: 14px; background-color: #f8fafc; padding: 15px; border-left: 4px solid #0ea5e9; border-radius: 0 4px 4px 0;">
                ${settings.notes}
              </div>
            </div>
          ` : ''}
          
          ${settings.terms ? `
            <div>
              <h3 style="color: #1e293b; font-size: 16px; margin-bottom: 8px;">Terms & Conditions</h3>
              <div style="color: #475569; font-size: 14px;">
                ${settings.terms}
              </div>
            </div>
          ` : ''}
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0;">
        <p>Thank you for your business!</p>
        ${business.website ? `<p>${business.website}</p>` : ''}
      </div>
    </div>
  `;
};

/**
 * Minimal invoice template
 */
const getMinimalTemplate = (invoice: InvoiceState): string => {
  const { business, customer, products, totals, settings, logo } = invoice;
  
  if (!business) {
    throw new Error('Business information is required');
  }
  
  // Format currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency.code,
      minimumFractionDigits: settings.currency.decimals,
      maximumFractionDigits: settings.currency.decimals,
    }).format(amount);
  };
  
  // Generate products HTML
  const productsHTML = products.map(product => {
    const productTotal = totals.productTotals[product.id];
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9;">${product.name}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: center;">${product.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right;">${formatAmount(productTotal?.total || 0)}</td>
      </tr>
    `;
  }).join('');
  
  return `
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1e293b; background-color: white;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px;">
        <div>
          ${logo ? `<img src="${logo}" alt="Business Logo" style="max-width: 100px; max-height: 70px;" />` : ''}
          <h1 style="color: #1e293b; margin-top: ${logo ? '10px' : '0'}; margin-bottom: 0; font-size: 20px;">${business.name}</h1>
        </div>
        <div style="text-align: right;">
          <h2 style="color: #475569; font-size: 24px; margin: 0; font-weight: 500;">Invoice</h2>
          <div style="color: #94a3b8; font-size: 14px; margin-top: 5px;">${settings.invoiceNumber}</div>
        </div>
      </div>
      
      <!-- Info Section -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; color: #475569; font-size: 14px;">
        <!-- Business Information -->
        <div style="flex: 1;">
          <div style="margin-bottom: 5px;">${business.address}</div>
          <div style="margin-bottom: 5px;">${business.city}, ${business.state} ${business.zip}</div>
          <div style="margin-bottom: 5px;">${business.country}</div>
          <div style="margin-bottom: 5px;">${business.phone}</div>
          <div style="margin-bottom: 5px;">${business.email}</div>
        </div>
        
        <!-- Client Information -->
        <div style="flex: 1; text-align: right;">
          ${customer ? `
            <div style="font-weight: 500; margin-bottom: 5px;">Bill To:</div>
            <div style="margin-bottom: 5px;">${customer.name}</div>
            ${customer.address ? `<div style="margin-bottom: 5px;">${customer.address}</div>` : ''}
            ${customer.city ? `<div style="margin-bottom: 5px;">${customer.city}${customer.state ? `, ${customer.state}` : ''}${customer.zip ? ` ${customer.zip}` : ''}</div>` : ''}
            ${customer.email ? `<div style="margin-bottom: 5px;">${customer.email}</div>` : ''}
          ` : '<div>No client information</div>'}
        </div>
      </div>
      
      <!-- Invoice Details -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background-color: #f8fafc; padding: 15px; font-size: 14px;">
        <div>
          <div style="color: #64748b; margin-bottom: 5px;">Date</div>
          <div style="color: #1e293b;">${new Date(settings.issueDate).toLocaleDateString()}</div>
        </div>
        
        ${settings.dueDate ? `
          <div>
            <div style="color: #64748b; margin-bottom: 5px;">Due Date</div>
            <div style="color: #1e293b;">${new Date(settings.dueDate).toLocaleDateString()}</div>
          </div>
        ` : ''}
        
        <div>
          <div style="color: #64748b; margin-bottom: 5px;">Amount Due</div>
          <div style="color: #1e293b; font-weight: 600;">${formatAmount(totals.grandTotal)}</div>
        </div>
      </div>
      
      <!-- Products Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="color: #64748b; text-align: left; font-size: 14px;">
            <th style="padding: 8px 0; border-bottom: 2px solid #f1f5f9;">Description</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #f1f5f9; text-align: center;">Qty</th>
            <th style="padding: 8px 0; border-bottom: 2px solid #f1f5f9; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${productsHTML}
        </tbody>
      </table>
      
      <!-- Totals -->
      <div style="margin-left: auto; width: 200px; margin-bottom: 40px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <div style="color: #64748b;">Subtotal</div>
          <div>${formatAmount(totals.subtotal)}</div>
        </div>
        
        ${totals.totalDiscount > 0 && settings.showDiscounts ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #64748b;">Discount</div>
            <div>-${formatAmount(totals.totalDiscount)}</div>
          </div>
        ` : ''}
        
        ${totals.totalTax > 0 && settings.showTaxes ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div style="color: #64748b;">Tax</div>
            <div>${formatAmount(totals.totalTax)}</div>
          </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; font-weight: 600; margin-top: 10px; padding-top: 10px; border-top: 1px solid #f1f5f9;">
          <div>Total</div>
          <div>${formatAmount(totals.grandTotal)}</div>
        </div>
      </div>
      
      <!-- Notes and Terms -->
      ${settings.notes ? `
        <div style="margin-bottom: ${settings.terms ? '20px' : '40px'}; font-size: 14px; color: #475569;">
          <div style="color: #64748b; margin-bottom: 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Notes</div>
          <div>${settings.notes}</div>
        </div>
      ` : ''}
      
      ${settings.terms ? `
        <div style="margin-bottom: 40px; font-size: 14px; color: #475569;">
          <div style="color: #64748b; margin-bottom: 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Terms & Conditions</div>
          <div>${settings.terms}</div>
        </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
        <p>Thank you for your business!</p>
      </div>
    </div>
  `;
};