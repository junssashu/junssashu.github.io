/**
 * ProductForm component
 * For adding and editing products in the invoice
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useInvoice } from '../context/InvoiceContext';
import { useEnterprise } from '@/features/enterprise/context/EnterpriseContext';
import { ProductFormData } from '../types/product.types';
import { Button, Input } from '@/shared/components/ui';
import { Plus } from 'lucide-react';

interface ProductFormProps {
  productId?: string;
  onSubmit: () => void;
}

const ProductForm = ({ productId, onSubmit }: ProductFormProps) => {
  const { invoice, addProduct, updateProduct } = useInvoice();
  const { enterprise } = useEnterprise();
  
  // Get product if editing existing product
  const existingProduct = productId 
    ? invoice.products.find(p => p.id === productId)
    : undefined;
  
  // Set up form
  const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm<ProductFormData>({
    defaultValues: existingProduct || {
      name: '',
      description: '',
      quantity: 1,
      price: 0,
      discount: 0,
      discountType: 'percentage',
      taxId: enterprise.taxSettings.defaultTax,
      taxIncluded: false,
    },
    mode: 'onChange',
  });
  
  // Watch discount fields
  const discountType = watch('discountType');
  
  // Handle form submission
  const handleFormSubmit = (data: ProductFormData) => {
    if (productId) {
      updateProduct(productId, data);
    } else {
      addProduct({
        id: `product-${Date.now()}`,
        ...data,
      });
    }
    
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-1">
          Product Name*
        </label>
        <Input
          id="name"
          placeholder="Product or Service Name"
          error={errors.name?.message}
          fullWidth
          {...register('name', { required: 'Product name is required' })}
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-primary-900 mb-1">
          Description
        </label>
        <textarea
          id="description"
          placeholder="Product or service description (optional)"
          className="w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
          rows={2}
          {...register('description')}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-primary-900 mb-1">
            Quantity*
          </label>
          <Input
            id="quantity"
            type="number"
            min="1"
            step="1"
            error={errors.quantity?.message}
            fullWidth
            {...register('quantity', { 
              required: 'Quantity is required',
              valueAsNumber: true,
              min: {
                value: 1,
                message: 'Minimum quantity is 1',
              },
            })}
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-primary-900 mb-1">
            Unit Price*
          </label>
          <Input
            id="price"
            type="number"
            min="0"
            step="0.01"
            error={errors.price?.message}
            fullWidth
            rightIcon={<span className="text-neutral-500">{enterprise.settings.currency.symbol}</span>}
            {...register('price', {
              required: 'Price is required',
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Price must be zero or positive',
              },
            })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-primary-900 mb-1">
            Discount
          </label>
          <Input
            id="discount"
            type="number"
            min="0"
            step={discountType === 'percentage' ? '1' : '0.01'}
            fullWidth
            rightIcon={
              <span className="text-neutral-500">
                {discountType === 'percentage' ? '%' : enterprise.settings.currency.symbol}
              </span>
            }
            {...register('discount', {
              valueAsNumber: true,
              min: {
                value: 0,
                message: 'Discount must be zero or positive',
              },
            })}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-primary-900 mb-1">
            Discount Type
          </label>
          <select
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
            {...register('discountType')}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary-900 mb-1">
            Tax
          </label>
          <select
            className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-accent-500 focus:ring focus:ring-accent-200 focus:ring-opacity-50"
            {...register('taxId')}
          >
            <option value="">No Tax</option>
            {enterprise.taxSettings.taxes
              .filter(tax => tax.enabled)
              .map(tax => (
                <option key={tax.id} value={tax.id}>
                  {tax.name} ({tax.type === 'percentage' ? `${tax.rate}%` : `${enterprise.settings.currency.symbol}${tax.rate}`})
                </option>
              ))}
          </select>
        </div>
        
        <div className="flex items-end">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-neutral-300 text-accent-600 shadow-sm focus:border-accent-300 focus:ring focus:ring-offset-0 focus:ring-accent-200 focus:ring-opacity-50"
              {...register('taxIncluded')}
            />
            <span className="text-sm text-primary-800">Tax included in price</span>
          </label>
        </div>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          fullWidth
          leftIcon={<Plus size={16} />}
          disabled={!isValid}
        >
          {productId ? 'Update Product' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;

export { ProductForm }