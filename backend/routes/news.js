// routes/news.js
import { Router } from "express";
import {
    getPrefs, savePrefs, updatePrefs,
    getDigest,
    getQuiz, submitScore, getLeaderboardHandler,
    getJournal, createJournalEntry, deleteJournalEntry,
} from "../controllers/newsController.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.get("/prefs", getPrefs);
router.post("/prefs", savePrefs);
router.put("/prefs", updatePrefs);
router.get("/digest", getDigest);
router.get("/quiz", getQuiz);
router.post("/quiz/submit", submitScore);
router.get("/quiz/leaderboard", getLeaderboardHandler);
router.get("/journal", getJournal);
router.post("/journal", createJournalEntry);
router.delete("/journal/:id", deleteJournalEntry);

export default router;
