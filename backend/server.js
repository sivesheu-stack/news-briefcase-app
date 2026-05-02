// server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import newsRouter from "./routes/news.js";

const app = express();
const PORT = process.env.PORT ?? 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: "*", credentials: false }));
app.use(express.json());
app.use(morgan("dev"));

// ── Health check (test this first in browser) ─────────────────────────────────
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", newsRouter);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message ?? "Internal server error" });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Briefcase API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});