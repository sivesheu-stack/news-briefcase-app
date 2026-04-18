// src/utils/storage.js
// Thin wrapper around localStorage for type-safe get/set.

export const storage = {
    get(key, fallback = null) {
        try {
            const raw = localStorage.getItem(key);
            return raw !== null ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    },

    set(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ }
    },

    del(key) {
        try { localStorage.removeItem(key); } catch { /* noop */ }
    },
};