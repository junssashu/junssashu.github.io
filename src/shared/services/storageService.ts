/**
 * Storage service for managing browser storage operations
 */

import { STORAGE_KEYS, STORAGE_LIMITS } from '../constants/storage.constants';
import { StorageKey } from '../types/common.types';

/**
 * Checks if storage is available in the browser
 */
export const checkStorageAvailability = (type: 'sessionStorage' | 'localStorage'): boolean => {
  try {
    const storage = window[type];
    const testKey = `${STORAGE_KEYS.enterprise}_test`;
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Gets an item from session storage
 */
export const getFromStorage = <T>(key: StorageKey): T | null => {
  try {
    const item = sessionStorage.getItem(STORAGE_KEYS[key]);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error(`Error getting ${key} from storage:`, e);
    return null;
  }
};

/**
 * Saves an item to session storage
 */
export const saveToStorage = <T>(key: StorageKey, data: T): boolean => {
  try {
    const serialized = JSON.stringify(data);
    const size = new Blob([serialized]).size;
    
    // Check if the data exceeds the size limit for this storage key
    if (size > STORAGE_LIMITS[key]) {
      console.warn(`Data for ${key} exceeds size limit of ${STORAGE_LIMITS[key]} bytes`);
      return false;
    }
    
    // Check if total storage used is within limits
    const totalStorageUsed = calculateTotalStorageUsed();
    const newTotal = totalStorageUsed - (getStorageSize(key) || 0) + size;
    
    if (newTotal > STORAGE_LIMITS.total) {
      console.warn(`Total storage would exceed limit of ${STORAGE_LIMITS.total} bytes`);
      return false;
    }
    
    sessionStorage.setItem(STORAGE_KEYS[key], serialized);
    return true;
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
    return false;
  }
};

/**
 * Removes an item from session storage
 */
export const removeFromStorage = (key: StorageKey): void => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS[key]);
  } catch (e) {
    console.error(`Error removing ${key} from storage:`, e);
  }
};

/**
 * Gets the size of a stored item in bytes
 */
export const getStorageSize = (key: StorageKey): number | null => {
  try {
    const item = sessionStorage.getItem(STORAGE_KEYS[key]);
    return item ? new Blob([item]).size : 0;
  } catch (e) {
    console.error(`Error getting size for ${key}:`, e);
    return null;
  }
};

/**
 * Calculates total storage used by the application
 */
export const calculateTotalStorageUsed = (): number => {
  try {
    return Object.keys(STORAGE_KEYS).reduce((total, key) => {
      const size = getStorageSize(key as StorageKey) || 0;
      return total + size;
    }, 0);
  } catch (e) {
    console.error('Error calculating total storage used:', e);
    return 0;
  }
};

/**
 * Clears all application storage
 */
export const clearAllStorage = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (e) {
    console.error('Error clearing all storage:', e);
  }
};

/**
 * Exports all storage data as a JSON string
 */
export const exportStorage = (): string => {
  try {
    const data = Object.entries(STORAGE_KEYS).reduce((acc, [key, storageKey]) => {
      acc[key] = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      return acc;
    }, {} as Record<string, unknown>);
    
    return JSON.stringify(data);
  } catch (e) {
    console.error('Error exporting storage:', e);
    return JSON.stringify({});
  }
};

/**
 * Imports storage data from a JSON string
 */
export const importStorage = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    
    Object.entries(data).forEach(([key, value]) => {
      if (key in STORAGE_KEYS && value !== null) {
        saveToStorage(key as StorageKey, value);
      }
    });
    
    return true;
  } catch (e) {
    console.error('Error importing storage:', e);
    return false;
  }
};