/**
 * LogoUploader component
 * Handles uploading and processing the business logo
 */

import React, { useState } from 'react';
import { useEnterprise } from '../context/EnterpriseContext';
import { processLogo } from '../services/logoProcessor';
import { Button, Card } from '@/shared/components/ui';
import { Upload, X, Image, ArrowLeft, ArrowRight } from 'lucide-react';

interface LogoUploaderProps {
  onNext: () => void;
  onBack: () => void;
}

const LogoUploader = ({ onNext, onBack }: LogoUploaderProps) => {
  const { enterprise, updateLogo } = useEnterprise();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please select an image file (JPEG, PNG, GIF, SVG)');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Process logo (resize and compress)
      const processedLogo = await processLogo(file);
      
      // Update logo in enterprise state
      updateLogo(processedLogo);
      
      // Reset input value
      e.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process logo');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove logo
  const handleRemoveLogo = () => {
    updateLogo(undefined);
  };
  
  // Continue without logo
  const handleSkip = () => {
    onNext();
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-accent-400', 'bg-accent-50');
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-accent-400', 'bg-accent-50');
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-accent-400', 'bg-accent-50');
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please select an image file (JPEG, PNG, GIF, SVG)');
      return;
    }
    
    try {
      setIsUploading(true);
      setError(null);
      
      // Process logo (resize and compress)
      const processedLogo = await processLogo(file);
      
      // Update logo in enterprise state
      updateLogo(processedLogo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process logo');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-primary-900">Upload Your Business Logo</h2>
        <p className="text-neutral-500 mt-1">Add your logo for a professional touch on your invoices.</p>
      </div>
      
      {/* Logo preview */}
      {enterprise.logo ? (
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-4">
            <img 
              src={enterprise.logo} 
              alt="Business Logo" 
              className="max-h-32 max-w-full rounded shadow-sm border border-neutral-200 object-contain bg-white p-2"
            />
            <button
              className="absolute -top-3 -right-3 bg-danger-100 hover:bg-danger-200 text-danger-700 rounded-full p-1"
              onClick={handleRemoveLogo}
              type="button"
              aria-label="Remove logo"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-neutral-500">Logo added successfully!</p>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-accent-300 transition-colors duration-200 cursor-pointer"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('logo-input')?.click()}
        >
          <input
            type="file"
            id="logo-input"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <div className="flex flex-col items-center justify-center space-y-2">
            {isUploading ? (
              <div className="animate-pulse">
                <div className="rounded-full bg-accent-100 p-3">
                  <Upload className="h-8 w-8 text-accent-500" />
                </div>
                <p className="mt-2 text-sm text-neutral-500">Processing...</p>
              </div>
            ) : (
              <>
                <div className="rounded-full bg-accent-100 p-3">
                  <Image className="h-8 w-8 text-accent-500" />
                </div>
                <p className="mt-2 text-sm font-medium text-primary-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-neutral-500">
                  SVG, PNG, JPG or GIF (max size: 1MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && <p className="text-sm text-danger-600 text-center">{error}</p>}
      
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          leftIcon={<ArrowLeft size={16} />}
        >
          Back
        </Button>
        <div className="space-x-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={onNext}
            disabled={isUploading}
            rightIcon={<ArrowRight size={16} />}
          >
            Next: Tax Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;