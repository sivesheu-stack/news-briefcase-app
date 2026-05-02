// src/api/api.js
const BASE = import.meta.env.VITE_API_BASE ?? "http://10.210.2.14:5000/api";

async function request(method, path, body) {
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body !== undefined) opts.body = JSON.stringify(body);

    const res = await fetch(BASE + path, opts);
    if (res.status === 204) return null;

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data;
}

export const api = {
    prefs: {
        get: () => request("GET", "/prefs"),
        create: (body) => request("POST", "/prefs", body),
        update: (body) => request("PUT", "/prefs", body),
    },
    digest: {
        today: (refresh = false) =>
            request("GET", `/digest${refresh ? "?refresh=true" : ""}`),
    },
    quiz: {
        generate: () => request("GET", "/quiz"),
        submit: (body) => request("POST", "/quiz/submit", body),
        leaderboard: () => request("GET", "/quiz/leaderboard"),
    },
    journal: {
        list: (search = "") =>
            request("GET", `/journal${search ? `?search=${encodeURIComponent(search)}` : ""}`),
        create: (body) => request("POST", "/journal", body),
        remove: (id) => request("DELETE", `/journal/${id}`),
    },
};