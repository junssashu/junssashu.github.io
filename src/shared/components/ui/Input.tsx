/**
 * Input component for form fields
 */

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/classNames';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    error,
    fullWidth = false,
    leftIcon,
    rightIcon,
    disabled,
    ...props
  }, ref) => {
    
    // Base styles
    const baseStyles = 'flex h-10 rounded-md border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
    
    // State styles
    const stateStyles = error
      ? 'border-danger-300 focus-visible:ring-danger-400 text-danger-900 focus:border-danger-500'
      : 'border-neutral-300 focus-visible:ring-accent-400 focus:border-accent-500';
      
    // Icon styles
    const withLeftIconStyles = leftIcon ? 'pl-9' : '';
    const withRightIconStyles = rightIcon ? 'pr-9' : '';
    
    return (
      <div className={cn('relative', fullWidth && 'w-full', className)}>
        {leftIcon && (
          <div className="absolute left-3 top-0 flex h-10 items-center text-neutral-500">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            baseStyles,
            stateStyles,
            withLeftIconStyles,
            withRightIconStyles,
            fullWidth && 'w-full',
            className
          )}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-0 flex h-10 items-center text-neutral-500">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-xs text-danger-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';