import { useState } from 'react';

/**
 * Persist state to localStorage.
 * Usage: const [val, setVal] = useLocalStorage('key', defaultVal);
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const val = value instanceof Function ? value(storedValue) : value;
      setStoredValue(val);
      window.localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('useLocalStorage error:', e);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
