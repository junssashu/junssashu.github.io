/**
 * FloatingActionButton component for primary actions
 */

import React from 'react';
import { cn } from '@/shared/utils/classNames';

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

export const FloatingActionButton = ({
  className,
  icon,
  position = 'bottom-right',
  variant = 'primary',
  size = 'md',
  tooltip,
  ...props
}: FloatingActionButtonProps) => {
  // Position styles
  const positionStyles = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg hover:shadow-xl',
    success: 'bg-success-600 hover:bg-success-700 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-lg hover:shadow-xl',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  // Icon size
  const iconSizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-7 w-7',
  };
  
  return (
    <button
      className={cn(
        'fixed z-10 rounded-full flex items-center justify-center transition-all duration-200 animate-scale-in',
        positionStyles[position],
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type="button"
      aria-label={tooltip || 'Action button'}
      {...props}
    >
      <span className={cn('flex items-center justify-center', iconSizeClasses[size])}>
        {icon}
      </span>
      
      {tooltip && (
        <span className="absolute bottom-full mb-2 hidden rounded bg-primary-800 px-2 py-1 text-xs text-white group-hover:block">
          {tooltip}
        </span>
      )}
    </button>
  );
};