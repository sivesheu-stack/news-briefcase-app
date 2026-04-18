// src/hooks/useLocalStorage.js
import { useState, useCallback } from "react";
import { storage } from "../utils/storage.js";

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => storage.get(key, initialValue));

    const setValue = useCallback((value) => {
        const toStore = typeof value === "function" ? value(storedValue) : value;
        storage.set(key, toStore);
        setStoredValue(toStore);
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        storage.del(key);
        setStoredValue(initialValue);
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}