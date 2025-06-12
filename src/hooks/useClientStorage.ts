
"use client";

import { useState, useEffect, useCallback } from 'react';

function useClientStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // This effect should run once on mount (per key) to initialize from localStorage.
    if (typeof window === 'undefined') {
      return;
    }

    let valueFromStorage: T | undefined = undefined;
    let didReadFromStorage = false;

    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        valueFromStorage = JSON.parse(item) as T;
        didReadFromStorage = true;
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // If error, we'll fall back to initialValue and attempt to write it.
    }

    if (didReadFromStorage && valueFromStorage !== undefined) {
      // Value successfully read from storage
      setStoredValue(valueFromStorage);
    } else {
      // No value in storage or error reading, use initialValue and write it to storage.
      setStoredValue(initialValue);
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      } catch (error) {
        console.error(`Error writing initial value to localStorage key "${key}":`, error);
      }
    }
    setIsInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // initialValue is intentionally omitted. The closure will capture the initialValue
              // from the first render, which is appropriate for a "default value" behavior.

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined' || !isInitialized) {
      console.warn(`localStorage not available or not initialized yet. Skipping update for key "${key}".`);
      // Still, update the state so the UI reflects the change, even if localStorage isn't ready.
      // The value will be written to localStorage once isInitialized is true if this occurs before.
      // However, the current logic in useEffect will overwrite this if it runs after.
      // For simplicity, we'll keep the original behavior of not setting state if not initialized.
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
