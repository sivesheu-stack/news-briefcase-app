// controllers/newsController.js
import { fetchAllFeeds } from "../services/rssService.js";
import { generateDigest } from "../services/aiService.js";
import { generateQuiz } from "../services/quizService.js";
import { updateStreak, getStreak, getLeaderboard } from "../services/rankingService.js";
import { cacheGet, cacheSet, cacheDel } from "../utils/redis.js";
import { digestKey, quizKey } from "../utils/hash.js";
import { VALID_LEVELS, VALID_INTERESTS } from "../config/constants.js";
import logger from "../utils/logger.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
function validatePrefs(prefs) {
    const { city, country, level, interests } = prefs;
    if (!city?.trim()) return "city is required";
    if (!VALID_LEVELS.includes(level)) return `level must be one of: ${VALID_LEVELS.join(", ")}`;
    if (!Array.isArray(interests) || interests.length === 0) return "at least one interest is required";
    const bad = interests.filter((i) => !VALID_INTERESTS.includes(i));
    if (bad.length) return `unknown interests: ${bad.join(", ")}`;
    return null;
}

// ── Preferences ───────────────────────────────────────────────────────────────
export async function getPrefs(req, res) {
    const prefs = await cacheGet("prefs:default");
    res.json(prefs ?? null);
}

export async function savePrefs(req, res) {
    const { city, country = "India", level = "intermediate", interests } = req.body;
    const err = validatePrefs({ city, country, level, interests });
    if (err) return res.status(400).json({ error: err });
    const prefs = { city: city.trim(), country: country.trim(), level, interests };
    await cacheSet("prefs:default", prefs, 60 * 60 * 24 * 365);
    res.json({ ok: true });
}

export async function updatePrefs(req, res) {
    const existing = await cacheGet("prefs:default");
    if (!existing) return res.status(404).json({ error: "No preferences found. POST /api/prefs first." });
    const merged = { ...existing, ...req.body };
    const err = validatePrefs(merged);
    if (err) return res.status(400).json({ error: err });
    const oldKey = digestKey(existing);
    await cacheDel(oldKey);
    await cacheDel(quizKey(oldKey));
    await cacheSet("prefs:default", merged, 60 * 60 * 24 * 365);
    res.json({ ok: true });
}

// ── Digest ────────────────────────────────────────────────────────────────────
export async function getDigest(req, res) {
    const refresh = req.query.refresh === "true";
    const prefs = await cacheGet("prefs:default");
    if (!prefs) return res.status(400).json({ error: "Complete onboarding first." });

    const cKey = digestKey(prefs);

    if (!refresh) {
        const cached = await cacheGet(cKey);
        if (cached) {
            logger.info(`Digest cache HIT`);
            return res.json({ cached: true, digest: cached });
        }
    }

    logger.info(`Generating fresh digest...`);
    const articles = await fetchAllFeeds(prefs.interests);
    if (!articles.length) return res.status(503).json({ error: "No articles fetched. Try again shortly." });

    const digest = await generateDigest(articles, prefs);
    await cacheSet(cKey, digest, Number(process.env.DIGEST_CACHE_TTL ?? 43200));
    res.json({ cached: false, digest });
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
export async function getQuiz(req, res) {
    const prefs = await cacheGet("prefs:default");
    if (!prefs) return res.status(400).json({ error: "Complete onboarding first." });

    const dKey = digestKey(prefs);
    const qKey = quizKey(dKey);

    const cachedQuiz = await cacheGet(qKey);
    if (cachedQuiz) {
        logger.info(`Quiz cache HIT`);
        return res.json({ questions: cachedQuiz });
    }

    const digest = await cacheGet(dKey);
    if (!digest) return res.status(400).json({ error: "Generate today's digest before taking the quiz." });

    const questions = await generateQuiz(digest, prefs.level);
    await cacheSet(qKey, questions, Number(process.env.QUIZ_CACHE_TTL ?? 43200));
    res.json({ questions });
}

export async function submitScore(req, res) {
    const { score, total } = req.body;
    if (typeof score !== "number" || typeof total !== "number") {
        return res.status(400).json({ error: "score and total must be numbers" });
    }
    const streak = await updateStreak("default");
    const leaderboard = await getLeaderboard("default");
    res.json({ streak, leaderboard });
}

export async function getLeaderboardHandler(req, res) {
    const leaderboard = await getLeaderboard("default");
    const streak = await getStreak("default");
    res.json({ streak, leaderboard });
}

// ── Journal ───────────────────────────────────────────────────────────────────
const JOURNAL_KEY = "journal:default";
const MOODS = ["💡", "🤔", "📊", "🌍", "📝", "🔍", "⚡", "🎯"];

async function loadJournal() {
    return (await cacheGet(JOURNAL_KEY)) ?? [];
}
async function saveJournal(entries) {
    await cacheSet(JOURNAL_KEY, entries, 60 * 60 * 24 * 365);
}

export async function getJournal(req, res) {
    const { search = "" } = req.query;
    let entries = await loadJournal();
    if (search.trim()) {
        const q = search.toLowerCase();
        entries = entries.filter(
            (e) => e.text.toLowerCase().includes(q) || e.date.toLowerCase().includes(q)
        );
    }
    res.json(entries);
}

export async function createJournalEntry(req, res) {
    const { text, mood } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text is required" });
    const validMood = MOODS.includes(mood) ? mood : MOODS[Math.floor(Math.random() * MOODS.length)];
    const dateStr = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    const entry = { id: Date.now(), text: text.trim(), mood: validMood, date: dateStr, createdAt: new Date().toISOString() };
    const entries = await loadJournal();
    entries.unshift(entry);
    await saveJournal(entries);
    res.status(201).json(entry);
}

export async function deleteJournalEntry(req, res) {
    const id = Number(req.params.id);
    const entries = await loadJournal();
    const next = entries.filter((e) => e.id !== id);
    if (next.length === entries.length) return res.status(404).json({ error: "Entry not found" });
    await saveJournal(next);
    res.status(204).end();
}
