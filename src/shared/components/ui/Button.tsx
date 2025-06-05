/**
 * Button component for primary actions
 */

import React, { forwardRef } from 'react';
import { cn } from '@/shared/utils/classNames';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled,
    children,
    leftIcon,
    rightIcon,
    ...props
  }, ref) => {
    
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Variant styles
    const variantStyles = {
      primary: 'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-accent-500',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus-visible:ring-secondary-500',
      outline: 'border border-primary-300 text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-500',
      ghost: 'text-primary-700 hover:bg-primary-100 active:bg-primary-200 focus-visible:ring-primary-500',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus-visible:ring-danger-500',
      success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-800 focus-visible:ring-success-500',
    };
    
    // Size styles
    const sizeStyles = {
      sm: 'text-xs h-8 px-3 py-1',
      md: 'text-sm h-10 px-4 py-2',
      lg: 'text-base h-12 px-6 py-3',
      icon: 'text-sm h-10 w-10',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          loading && 'cursor-wait',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="animate-spin mr-2">
            <svg 
              className="h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : leftIcon ? (
          <span className="mr-2">{leftIcon}</span>
        ) : null}
        
        {children}
        
        {rightIcon && !loading && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';