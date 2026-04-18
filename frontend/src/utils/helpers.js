// src/utils/helpers.js

export function todayLabel() {
    return new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
}

export function formatDate(str) {
    if (!str) return "";
    try {
        return new Date(str).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        });
    } catch {
        return str;
    }
}

export function tileColor(index) {
    const palettes = [
        { bg: "#1a1a2e", accent: "#e94560" },
        { bg: "#0f3460", accent: "#e94560" },
        { bg: "#16213e", accent: "#4cc9f0" },
        { bg: "#533483", accent: "#e94560" },
        { bg: "#1b4332", accent: "#52b788" },
        { bg: "#1d3557", accent: "#a8dadc" },
        { bg: "#3d0000", accent: "#ff6b6b" },
        { bg: "#2d3436", accent: "#fdcb6e" },
    ];
    return palettes[index % palettes.length];
}

export function buildReadAloudText(digest) {
    if (!digest?.sections) return "";
    let text = `Good morning. Here is your daily briefing for ${todayLabel()}. `;
    for (const section of digest.sections) {
        text += `${section.category}. `;
        for (const story of section.stories ?? []) {
            text += `${story.title}. ${story.summary} Key implication: ${story.implication} `;
        }
    }
    return text;
}

export function scoreLabel(pct) {
    if (pct >= 80) return "Excellent work!";
    if (pct >= 60) return "Good effort!";
    return "Keep reading!";
}