/**
 * CustomerForm component
 * Manages customer information for invoices
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useInvoice } from '../context/InvoiceContext';
import { Customer } from '../types/invoice.types';
import { Button, Input } from '@/shared/components/ui';
import { UserPlus } from 'lucide-react';

interface CustomerFormProps {
  onSubmit: () => void;
}

const CustomerForm = ({ onSubmit }: CustomerFormProps) => {
  const { invoice, updateCustomer } = useInvoice();
  
  // Set up form with existing customer data or defaults
  const { register, handleSubmit, formState: { errors, isValid } } = useForm<Customer>({
    defaultValues: invoice.customer || {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      taxNumber: '',
    },
    mode: 'onChange',
  });
  
  // Handle form submission
  const handleFormSubmit = (data: Customer) => {
    updateCustomer(data);
    onSubmit();
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-1">
          Customer/Client Name*
        </label>
        <Input
          id="name"
          placeholder="Customer or Client Name"
          error={errors.name?.message}
          fullWidth
          {...register('name', { required: 'Customer name is required' })}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            error={errors.email?.message}
            fullWidth
            {...register('email', { 
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email format',
              },
            })}
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-primary-900 mb-1">
            Phone
          </label>
          <Input
            id="phone"
            placeholder="Phone Number"
            fullWidth
            {...register('phone')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-primary-900 mb-1">
          Address
        </label>
        <Input
          id="address"
          placeholder="Street Address"
          fullWidth
          {...register('address')}
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="city" className="block text-sm font-medium text-primary-900 mb-1">
            City
          </label>
          <Input
            id="city"
            placeholder="City"
            fullWidth
            {...register('city')}
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-primary-900 mb-1">
            State/Province
          </label>
          <Input
            id="state"
            placeholder="State"
            fullWidth
            {...register('state')}
          />
        </div>
        
        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-primary-900 mb-1">
            Postal/Zip Code
          </label>
          <Input
            id="zip"
            placeholder="Zip Code"
            fullWidth
            {...register('zip')}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-primary-900 mb-1">
          Country
        </label>
        <Input
          id="country"
          placeholder="Country"
          fullWidth
          {...register('country')}
        />
      </div>
      
      <div>
        <label htmlFor="taxNumber" className="block text-sm font-medium text-primary-900 mb-1">
          Tax ID/VAT Number
        </label>
        <Input
          id="taxNumber"
          placeholder="Tax ID or VAT Number"
          fullWidth
          {...register('taxNumber')}
        />
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          fullWidth
          leftIcon={<UserPlus size={16} />}
          disabled={!isValid}
        >
          {invoice.customer ? 'Update Customer' : 'Add Customer'}
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;

export { CustomerForm }