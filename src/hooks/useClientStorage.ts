
"use client";

import { useState, useEffect, useCallback } from 'react';

function useClientStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
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
    }

    if (didReadFromStorage && valueFromStorage !== undefined) {
      setStoredValue(valueFromStorage);
    } else {
      setStoredValue(initialValue);
      try {
        window.localStorage.setItem(key, JSON.stringify(initialValue));
      } catch (error) {
        console.error(`Error writing initial value to localStorage key "${key}":`, error);
      }
    }
    setIsInitialized(true);
  }, [key]); // initialValue is intentionally omitted. The closure will capture the initialValue from the first render.

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined' || !isInitialized) {
      console.warn(`localStorage not available or not initialized yet. Skipping update for key "${key}".`);
      return;
    }
    try {
      // Use functional update for setStoredValue to remove storedValue from useCallback deps,
      // ensuring setValue has a stable reference.
      setStoredValue(prevStoredValue => {
        const valueToStore = value instanceof Function ? value(prevStoredValue) : value;
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, isInitialized]); // Removed storedValue, setStoredValue from react is stable
  
  return [isInitialized ? storedValue : initialValue, setValue];
}

export default useClientStorage;
