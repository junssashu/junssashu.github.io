/**
 * Modal component for displaying content in an overlay
 */

import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/shared/utils/classNames';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  footer?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  footer,
}: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close on click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnClickOutside) return;
    if (overlayRef.current === e.target) {
      onClose();
    }
  };
  
  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeOnEsc, isOpen, onClose]);
  
  // Set mounted state for SSR
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Modal animation on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.style.opacity = '0';
      modalRef.current.style.transform = 'scale(0.95)';
      
      // Force reflow for animation
      // eslint-disable-next-line no-void
      void modalRef.current.offsetWidth;
      
      modalRef.current.style.opacity = '1';
      modalRef.current.style.transform = 'scale(1)';
    }
  }, [isOpen]);
  
  // Size styles
  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] h-[90vh]',
  };
  
  // Don't render on server
  if (!isMounted) return null;
  
  // Don't render if modal is closed
  if (!isOpen) return null;
  
  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        className={cn(
          'rounded-lg bg-white shadow-xl transition-all duration-200',
          sizeStyles[size],
          size === 'full' ? 'flex flex-col' : '',
          className
        )}
        style={{
          opacity: 0,
          transform: 'scale(0.95)',
          transition: 'opacity 200ms, transform 200ms',
        }}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-neutral-200 p-4 sm:p-6">
            {title && (
              <div>
                <h2 className="text-lg font-semibold text-primary-900">{title}</h2>
                {description && (
                  <p className="mt-1 text-sm text-neutral-500">{description}</p>
                )}
              </div>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Modal Body */}
        <div className={cn(
          'p-4 sm:p-6',
          size === 'full' ? 'flex-grow overflow-auto' : '',
          !title && !showCloseButton ? 'pt-6' : ''
        )}>
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className="border-t border-neutral-200 p-4 sm:p-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};