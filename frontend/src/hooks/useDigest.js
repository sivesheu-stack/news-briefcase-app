// src/hooks/useDigest.js
import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api.js";

/**
 * Manages fetching / caching the daily digest.
 * Returns { digest, status, error, refresh }
 * status: "idle" | "loading" | "done" | "error"
 */
export function useDigest() {
    const [digest, setDigest] = useState(null);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    const load = useCallback(async (forceRefresh = false) => {
        setStatus("loading");
        setError(null);
        try {
            const data = await api.digest.today(forceRefresh);
            setDigest(data.digest);
            setStatus("done");
        } catch (err) {
            setError(err.message);
            setStatus("error");
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return { digest, status, error, refresh: () => load(true) };
}