/**
 * Custom hook for managing browser storage operations
 */

import { useCallback, useEffect, useState } from 'react';
import { 
  getFromStorage, 
  saveToStorage, 
  removeFromStorage,
  getStorageSize,
  calculateTotalStorageUsed
} from '../services/storageService';
import { StorageKey } from '../types/common.types';
import { STORAGE_LIMITS } from '../constants/storage.constants';

export function useStorage<T>(key: StorageKey, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Get from storage on initial render
    const item = getFromStorage<T>(key);
    
    // Return stored item if it exists, otherwise initialValue
    return item !== null ? item : initialValue;
  });
  
  // Check storage size and get warnings
  const [sizeInfo, setSizeInfo] = useState({
    size: 0,
    limit: STORAGE_LIMITS[key],
    percentUsed: 0,
    isApproachingLimit: false,
    isAtLimit: false
  });
  
  // Update size information
  const updateSizeInfo = useCallback(() => {
    const size = getStorageSize(key) || 0;
    const percentUsed = (size / STORAGE_LIMITS[key]) * 100;
    
    setSizeInfo({
      size,
      limit: STORAGE_LIMITS[key],
      percentUsed,
      isApproachingLimit: percentUsed > 80,
      isAtLimit: percentUsed >= 95
    });
  }, [key]);
  
  // Check total storage usage
  const [totalStorageInfo, setTotalStorageInfo] = useState({
    totalUsed: 0,
    totalLimit: STORAGE_LIMITS.total,
    percentUsed: 0,
    isApproachingLimit: false,
    isAtLimit: false
  });
  
  // Update total storage information
  const updateTotalStorageInfo = useCallback(() => {
    const totalUsed = calculateTotalStorageUsed();
    const percentUsed = (totalUsed / STORAGE_LIMITS.total) * 100;
    
    setTotalStorageInfo({
      totalUsed,
      totalLimit: STORAGE_LIMITS.total,
      percentUsed,
      isApproachingLimit: percentUsed > 80,
      isAtLimit: percentUsed >= 95
    });
  }, []);
  
  // Run on mount and when storedValue changes
  useEffect(() => {
    updateSizeInfo();
    updateTotalStorageInfo();
  }, [storedValue, updateSizeInfo, updateTotalStorageInfo]);
  
  // Set the stored value
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for previous state pattern
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to state
      setStoredValue(valueToStore);
      
      // Save to storage
      const success = saveToStorage(key, valueToStore);
      
      if (!success) {
        console.warn(`Failed to save ${key} to storage due to size limits`);
      }
      
      // Update size information
      updateSizeInfo();
      updateTotalStorageInfo();
      
      return success;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  }, [key, storedValue, updateSizeInfo, updateTotalStorageInfo]);
  
  // Remove the value from storage
  const removeValue = useCallback(() => {
    try {
      // Remove from storage
      removeFromStorage(key);
      
      // Reset state to initial value
      setStoredValue(initialValue);
      
      // Update size information
      updateSizeInfo();
      updateTotalStorageInfo();
      
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  }, [key, initialValue, updateSizeInfo, updateTotalStorageInfo]);
  
  return {
    value: storedValue,
    setValue,
    removeValue,
    sizeInfo,
    totalStorageInfo
  };
}