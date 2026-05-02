// routes/news.js
import { Router } from "express";
import {
    getPrefs, savePrefs, updatePrefs,
    getDigest,
    getQuiz, submitScore, getLeaderboardHandler,
    getJournal, createJournalEntry, deleteJournalEntry,
} from "../controllers/newsController.js";

const router = Router();

// ── Health (also on router level for safety) ──────────────────────────────────
router.get("/health", (_req, res) => res.json({ status: "ok" }));

// ── Preferences ───────────────────────────────────────────────────────────────
router.get("/prefs", getPrefs);
router.post("/prefs", savePrefs);
router.put("/prefs", updatePrefs);

// ── Digest ────────────────────────────────────────────────────────────────────
router.get("/digest", getDigest);

// ── Quiz ──────────────────────────────────────────────────────────────────────
router.get("/quiz", getQuiz);
router.post("/quiz/submit", submitScore);
router.get("/quiz/leaderboard", getLeaderboardHandler);

// ── Journal ───────────────────────────────────────────────────────────────────
router.get("/journal", getJournal);
router.post("/journal", createJournalEntry);
router.delete("/journal/:id", deleteJournalEntry);

export default router;