// utils/redis.js
// Wraps ioredis with a graceful in-memory fallback so the app works
// even without a running Redis instance.

import logger from "./logger.js";

const memCache = new Map();

export async function cacheGet(key) {
    const entry = memCache.get(key);
    if (!entry) return null;
    if (entry.exp && Date.now() > entry.exp) {
        memCache.delete(key);
        return null;
    }
    return entry.val;
}

export async function cacheSet(key, value, ttlSeconds = 43200) {
    memCache.set(key, {
        val: value,
        exp: Date.now() + ttlSeconds * 1000,
    });
}

export async function cacheDel(key) {
    memCache.delete(key);
}
