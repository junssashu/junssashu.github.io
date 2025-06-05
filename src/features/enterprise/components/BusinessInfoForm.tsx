/**
 * BusinessInfoForm component
 * Collects business information during enterprise setup
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { useEnterprise } from '../context/EnterpriseContext';
import { BusinessInfo } from '../types/enterprise.types';
import { Button, Input } from '@/shared/components/ui';

interface BusinessInfoFormProps {
  onNext: () => void;
}

const BusinessInfoForm = ({ onNext }: BusinessInfoFormProps) => {
  const { enterprise, updateBusinessInfo } = useEnterprise();
  
  const { register, handleSubmit, formState: { errors, isValid, isDirty } } = useForm<BusinessInfo>({
    defaultValues: enterprise.businessInfo,
    mode: 'onChange',
  });
  
  const onSubmit = (data: BusinessInfo) => {
    updateBusinessInfo(data);
    onNext();
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-primary-900 mb-1">
          Business Name*
        </label>
        <Input
          id="name"
          placeholder="Your Business Name"
          error={errors.name?.message}
          fullWidth
          {...register('name', { required: 'Business name is required' })}
        />
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-primary-900 mb-1">
          Address*
        </label>
        <Input
          id="address"
          placeholder="Street Address"
          error={errors.address?.message}
          fullWidth
          {...register('address', { required: 'Address is required' })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-primary-900 mb-1">
            City*
          </label>
          <Input
            id="city"
            placeholder="City"
            error={errors.city?.message}
            fullWidth
            {...register('city', { required: 'City is required' })}
          />
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-primary-900 mb-1">
            State/Province*
          </label>
          <Input
            id="state"
            placeholder="State"
            error={errors.state?.message}
            fullWidth
            {...register('state', { required: 'State is required' })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-primary-900 mb-1">
            Postal/Zip Code*
          </label>
          <Input
            id="zip"
            placeholder="Zip Code"
            error={errors.zip?.message}
            fullWidth
            {...register('zip', { required: 'Zip code is required' })}
          />
        </div>
        
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-primary-900 mb-1">
            Country*
          </label>
          <Input
            id="country"
            placeholder="Country"
            error={errors.country?.message}
            fullWidth
            {...register('country', { required: 'Country is required' })}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-primary-900 mb-1">
            Phone*
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="Phone Number"
            error={errors.phone?.message}
            fullWidth
            {...register('phone', { required: 'Phone is required' })}
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-primary-900 mb-1">
            Email*
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            error={errors.email?.message}
            fullWidth
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email format',
              },
            })}
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-primary-900 mb-1">
          Website
        </label>
        <Input
          id="website"
          placeholder="https://yourbusiness.com"
          fullWidth
          {...register('website')}
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
          disabled={!isDirty || !isValid}
        >
          Next: Logo Upload
        </Button>
      </div>
    </form>
  );
};

export default BusinessInfoForm;