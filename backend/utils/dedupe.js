// utils/dedupe.js

function normalise(title = "") {
    return title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

export function dedupe(articles, limit = 35) {
    const seen = new Set();
    const out = [];
    for (const art of articles) {
        const key = normalise(art.title).slice(0, 60);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(art);
        if (out.length >= limit) break;
    }
    return out;
}