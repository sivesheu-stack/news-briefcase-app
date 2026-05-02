// utils/hash.js

function djb2(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) ^ str.charCodeAt(i);
        h = h >>> 0;
    }
    return h.toString(16).padStart(8, "0");
}

export function digestKey({ level, interests, city, country }) {
    const today = new Date().toISOString().slice(0, 10);
    const raw = `${today}|${level}|${city}|${country}|${[...interests].sort().join(",")}`;
    return `digest:${djb2(raw)}`;
}

export function quizKey(dKey) {
    return `quiz:${dKey.replace("digest:", "")}`;
}

export function streakKey(userId = "default") {
    return `streak:${userId}`;
}
