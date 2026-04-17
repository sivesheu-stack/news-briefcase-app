// routes/news.js
import express from "express";
import { fetchRSS } from "../services/rssService.js";
import { generateSummary } from "../services/aiService.js";
import { generateQuiz } from "../services/quizService.js";
import { dedupeArticles } from "../utils/dedupe.js";

const router = express.Router();

const SOURCES = [
    "https://www.business-standard.com/rss/markets-106.rss",
    "https://livemint.com/rss/markets",
];

router.get("/digest", async (req, res) => {
    const { level = "intermediate" } = req.query;

    const results = await Promise.all(SOURCES.map(fetchRSS));
    const articles = dedupeArticles(results.flat()).slice(0, 25);

    const summary = await generateSummary(articles, level, []);

    res.json({ articles, summary });
});

router.post("/quiz", async (req, res) => {
    const { text, level } = req.body;

    const quiz = await generateQuiz(text, level);
    res.json(quiz);
});

export default router;