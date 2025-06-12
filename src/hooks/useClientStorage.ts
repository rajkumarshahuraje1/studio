"use client";

import { useState, useEffect, useCallback } from 'react';

function useClientStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        } else {
          window.localStorage.setItem(key, JSON.stringify(initialValue));
          setStoredValue(initialValue);
        }
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error);
        window.localStorage.setItem(key, JSON.stringify(initialValue));
        setStoredValue(initialValue);
      }
      setIsInitialized(true);
    }
  }, [key, initialValue]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined' || !isInitialized) {
      console.warn(`localStorage not available or not initialized yet. Skipping update for key "${key}".`);
      return;
    }
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, isInitialized]);
  
  // Return initialValue until hydration is complete and value is read from localStorage
  return [isInitialized ? storedValue : initialValue, setValue];
}

export default useClientStorage;
