/**
 * Logo processing service
 * Handles resizing, compression, and color extraction of business logos
 */

import { LOGO_CONSTRAINTS } from '@/shared/constants/storage.constants';

/**
 * Resizes and compresses a logo image to fit storage constraints
 */
export const processLogo = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          // Determine new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > LOGO_CONSTRAINTS.maxWidth || height > LOGO_CONSTRAINTS.maxHeight) {
            const ratio = Math.min(
              LOGO_CONSTRAINTS.maxWidth / width,
              LOGO_CONSTRAINTS.maxHeight / height
            );
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          // Draw resized image
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to JPEG with compression
          let quality = 0.7; // start with 70% quality
          let result = canvas.toDataURL(LOGO_CONSTRAINTS.format, quality);
          let size = new Blob([result]).size / 1024; // convert to KB
          
          // Adjust quality until size is below limit or quality is too low
          while (size > LOGO_CONSTRAINTS.maxSizeKB && quality > 0.1) {
            quality -= 0.1;
            result = canvas.toDataURL(LOGO_CONSTRAINTS.format, quality);
            size = new Blob([result]).size / 1024;
          }
          
          if (size <= LOGO_CONSTRAINTS.maxSizeKB) {
            resolve(result);
          } else {
            reject(new Error(`Could not compress logo to fit size limit of ${LOGO_CONSTRAINTS.maxSizeKB}KB`));
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Extracts the dominant color from a logo image
 */
export const extractDominantColor = async (logoDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve('#1e293b'); // Default color
          return;
        }
        
        // Sample a small version for performance
        const sampleSize = 50;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        
        // Draw scaled-down image
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        
        // Initialize color counters
        const colorCounts: Record<string, number> = {};
        let maxCount = 0;
        let dominantColor = '#1e293b'; // Default color
        
        // Process each pixel
        for (let i = 0; i < imageData.length; i += 4) {
          // Skip transparent pixels
          if (imageData[i + 3] < 128) continue;
          
          // Get rounded RGB values for better color grouping
          const r = Math.round(imageData[i] / 10) * 10;
          const g = Math.round(imageData[i + 1] / 10) * 10;
          const b = Math.round(imageData[i + 2] / 10) * 10;
          
          const rgbColor = `rgb(${r},${g},${b})`;
          
          // Count occurrences of each color
          colorCounts[rgbColor] = (colorCounts[rgbColor] || 0) + 1;
          
          if (colorCounts[rgbColor] > maxCount) {
            maxCount = colorCounts[rgbColor];
            dominantColor = rgbColor;
          }
        }
        
        // Convert RGB to hex
        const rgbValues = dominantColor.match(/\d+/g);
        if (rgbValues && rgbValues.length === 3) {
          const hex = `#${Number(rgbValues[0]).toString(16).padStart(2, '0')}${Number(rgbValues[1]).toString(16).padStart(2, '0')}${Number(rgbValues[2]).toString(16).padStart(2, '0')}`;
          resolve(hex);
        } else {
          resolve('#1e293b'); // Default color
        }
      };
      
      img.onerror = () => {
        resolve('#1e293b'); // Default color on error
      };
      
      img.src = logoDataUrl;
    } catch (error) {
      resolve('#1e293b'); // Default color on error
    }
  });
};