/**
 * ProductList component
 * Displays list of products in the invoice
 */

import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { Product } from '../types/product.types';
import { formatCurrency } from '../services/invoiceCalculations';
import { ProductForm } from '.';
import { Modal, Card, Button } from '@/shared/components/ui';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';

const ProductList = () => {
  const { invoice, removeProduct } = useInvoice();
  const { enterprise } = useEnterprise();
  const { products, totals } = invoice;
  const { currency } = enterprise.settings;
  
  // State for editing product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Format currency amount
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency.code, currency.decimals);
  };
  
  // Open edit modal for a product
  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setIsEditModalOpen(true);
  };
  
  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProductId(null);
  };
  
  // Remove product after confirmation
  const handleRemoveProduct = (id: string) => {
    if (confirm('Are you sure you want to remove this product?')) {
      removeProduct(id);
    }
  };
  
  // If no products, show empty state
  if (products.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="bg-neutral-50 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-neutral-400" />
        </div>
        <h3 className="text-lg font-medium text-primary-900 mb-1">No Products Added</h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Add your first product or service to get started with your invoice.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          productTotal={totals.productTotals[product.id]}
          currency={currency}
          onEdit={handleEditProduct}
          onRemove={handleRemoveProduct}
        />
      ))}
      
      {/* Edit Product Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        title="Edit Product"
        size="md"
      >
        {editingProductId && (
          <ProductForm
            productId={editingProductId}
            onSubmit={handleCloseEditModal}
          />
        )}
      </Modal>
    </div>
  );
};

// Product Card component
interface ProductCardProps {
  product: Product;
  productTotal: any;
  currency: any;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
}

const ProductCard = ({ product, productTotal, currency, onEdit, onRemove }: ProductCardProps) => {
  // Format currency
  const formatAmount = (amount: number) => {
    return formatCurrency(amount, currency.code, currency.decimals);
  };
  
  return (
    <Card className="animate-fade-in overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-primary-900 text-base line-clamp-2">
            {product.name}
          </h3>
          <div className="flex space-x-1 ml-2">
            <button
              type="button"
              onClick={() => onEdit(product.id)}
              className="p-1 text-neutral-500 hover:text-primary-700 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(product.id)}
              className="p-1 text-neutral-500 hover:text-danger-700 hover:bg-danger-50 rounded-full transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        
        {product.description && (
          <p className="text-sm text-neutral-500 mt-1 mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2 text-sm">
          <div className="flex items-center text-primary-700">
            <span>{product.quantity} × </span>
            <span className="ml-1 font-medium">{formatAmount(product.price)}</span>
          </div>
          
          <div className="font-semibold text-primary-900">
            {formatAmount(productTotal?.total || product.quantity * product.price)}
          </div>
        </div>
        
        {/* Show discount if applicable */}
        {product.discount && product.discount > 0 && (
          <div className="mt-1 text-xs text-success-700 flex justify-between">
            <span>Discount:</span>
            <span>
              {product.discountType === 'percentage'
                ? `${product.discount}%`
                : formatAmount(product.discount)}
            </span>
          </div>
        )}
        
        {/* Show tax if applicable */}
        {productTotal?.taxAmount > 0 && (
          <div className="mt-1 text-xs text-neutral-500 flex justify-between">
            <span>Tax:</span>
            <span>{formatAmount(productTotal.taxAmount)}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductList;

export { ProductList }