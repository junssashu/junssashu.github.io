/**
 * InvoicePreview component
 * Displays a preview of the invoice
 */

import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { formatCurrency } from '../services/invoiceCalculations';
import { Card } from '@/shared/components/ui';

const InvoicePreview = () => {
  const { invoice } = useInvoice();
  const { enterprise } = useEnterprise();
  const { products, totals, customer, settings } = invoice;
  const { businessInfo, logo } = enterprise;
  const { currency } = settings;
  
  // Format currency
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency.code, currency.decimals);
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };
  
  // If no products, show empty state
  if (products.length === 0) {
    return (
      <div className="border border-dashed border-neutral-300 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-primary-900 mb-1">No Items Added Yet</h3>
        <p className="text-sm text-neutral-500">
          Add products or services to see your invoice preview.
        </p>
      </div>
    );
  }
  
  return (
    <div className="border border-neutral-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-primary-800 text-white p-6 flex justify-between items-start">
        <div>
          {logo && enterprise.settings.showLogo && (
            <img 
              src={logo} 
              alt={businessInfo.name} 
              className="h-16 max-w-[150px] object-contain mb-2 bg-white p-1 rounded"
            />
          )}
          <h2 className="text-xl font-bold">{businessInfo.name}</h2>
        </div>
        <div className="text-right">
          <h1 className="text-2xl font-bold tracking-wider uppercase">Invoice</h1>
          <p className="text-primary-100 mt-1">{settings.invoiceNumber}</p>
          <p className="text-primary-100 mt-1">Date: {formatDate(settings.issueDate)}</p>
          {settings.dueDate && (
            <p className="text-primary-100">Due: {formatDate(settings.dueDate)}</p>
          )}
        </div>
      </div>
      
      {/* Business & Customer Info */}
      <div className="p-6 bg-neutral-50 flex flex-col md:flex-row justify-between border-b border-neutral-200">
        <div className="mb-4 md:mb-0">
          <h3 className="text-sm font-semibold text-primary-700 uppercase mb-2">From</h3>
          <address className="not-italic text-sm text-primary-700">
            <p>{businessInfo.address}</p>
            <p>{businessInfo.city}, {businessInfo.state} {businessInfo.zip}</p>
            <p>{businessInfo.country}</p>
            <p className="mt-2">{businessInfo.phone}</p>
            <p>{businessInfo.email}</p>
            {businessInfo.website && <p>{businessInfo.website}</p>}
          </address>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-primary-700 uppercase mb-2">To</h3>
          {customer ? (
            <address className="not-italic text-sm text-primary-700">
              <p className="font-medium">{customer.name}</p>
              {customer.address && <p>{customer.address}</p>}
              {customer.city && (
                <p>
                  {customer.city}
                  {customer.state && `, ${customer.state}`}
                  {customer.zip && ` ${customer.zip}`}
                </p>
              )}
              {customer.country && <p>{customer.country}</p>}
              {(customer.phone || customer.email) && <div className="mt-2"></div>}
              {customer.phone && <p>{customer.phone}</p>}
              {customer.email && <p>{customer.email}</p>}
            </address>
          ) : (
            <p className="text-sm text-neutral-500 italic">No customer information</p>
          )}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="p-6">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr className="text-left text-xs font-medium text-primary-700 uppercase tracking-wider">
              <th className="pb-3">Item</th>
              <th className="pb-3 text-center">Qty</th>
              <th className="pb-3 text-right">Price</th>
              {settings.showDiscounts && (
                <th className="pb-3 text-right">Discount</th>
              )}
              {settings.showTaxes && (
                <th className="pb-3 text-right">Tax</th>
              )}
              <th className="pb-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map(product => {
              const productTotal = totals.productTotals[product.id] || {
                subtotal: 0,
                discountAmount: 0,
                taxableAmount: 0,
                taxAmount: 0,
                total: 0,
              };
              
              return (
                <tr key={product.id} className="text-sm text-primary-800">
                  <td className="py-3 pr-2">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="text-xs text-neutral-500 mt-1">
                        {product.description}
                      </div>
                    )}
                  </td>
                  <td className="py-3 text-center">{product.quantity}</td>
                  <td className="py-3 text-right">{formatAmount(product.price)}</td>
                  {settings.showDiscounts && (
                    <td className="py-3 text-right">
                      {product.discount && product.discount > 0
                        ? product.discountType === 'percentage'
                          ? `${product.discount}%`
                          : formatAmount(product.discount)
                        : '-'}
                    </td>
                  )}
                  {settings.showTaxes && (
                    <td className="py-3 text-right">
                      {productTotal.taxAmount > 0
                        ? formatAmount(productTotal.taxAmount)
                        : '-'}
                    </td>
                  )}
                  <td className="py-3 text-right font-medium">
                    {formatAmount(productTotal.total)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {/* Totals */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-primary-700">Subtotal:</span>
              <span className="text-primary-900 font-medium">
                {formatAmount(totals.subtotal)}
              </span>
            </div>
            
            {totals.totalDiscount > 0 && settings.showDiscounts && (
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Discount:</span>
                <span className="text-success-700 font-medium">
                  -{formatAmount(totals.totalDiscount)}
                </span>
              </div>
            )}
            
            {totals.totalTax > 0 && settings.showTaxes && (
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Tax:</span>
                <span className="text-primary-900 font-medium">
                  {formatAmount(totals.totalTax)}
                </span>
              </div>
            )}
            
            <div className="pt-2 mt-2 border-t border-neutral-200 flex justify-between">
              <span className="font-semibold text-primary-900">Total:</span>
              <span className="font-bold text-accent-700">
                {formatAmount(totals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Notes & Terms */}
        {(settings.notes || settings.terms) && (
          <div className="mt-8 space-y-4 text-sm">
            {settings.notes && (
              <div>
                <h3 className="font-medium text-primary-900 mb-1">Notes</h3>
                <p className="text-primary-700">{settings.notes}</p>
              </div>
            )}
            
            {settings.terms && (
              <div>
                <h3 className="font-medium text-primary-900 mb-1">Terms & Conditions</h3>
                <p className="text-primary-700">{settings.terms}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;

export { InvoicePreview }