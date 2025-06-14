
"use client";

import { useState, useEffect, useCallback } from 'react';

function useClientStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize storedValue with initialValue. It will be updated once localStorage is read.
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      // On the server or during build, consider it initialized to return initialValue.
      // This helps avoid trying to access localStorage.
      setIsInitialized(true); 
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      } else {
        // If not in storage, the state is already initialValue.
        // Optionally, write initialValue to storage if it's meant to be a default and isn't there.
        // For currentUser: null, if not in storage, we don't need to write null back.
        // window.localStorage.setItem(key, JSON.stringify(initialValue));
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      // storedValue remains initialValue in case of read error
    }
    setIsInitialized(true); // Signal that initial read attempt is complete
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]); // Effect runs once per key to load initial state.

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    if (typeof window === 'undefined') {
      // If window is not defined (e.g., SSR context after initial check), do nothing.
      return;
    }

    setStoredValue(currentStoredValue => {
      const newValue = value instanceof Function ? value(currentStoredValue) : value;
      // Only write to localStorage if the hook has been initialized (initial read from localStorage is done).
      // This prevents writing the initialValue (from useState) to localStorage before we've loaded the actual stored value.
      if (isInitialized) {
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      }
      return newValue;
    });
  }, [key, isInitialized]); // isInitialized ensures setValue gets an updated version after initialization.

  // Return initialValue if not yet initialized on the client, or always on SSR.
  // Once initialized on the client, return the actual storedValue.
  return [isInitialized ? storedValue : initialValue, setValue];
}

export default useClientStorage;
