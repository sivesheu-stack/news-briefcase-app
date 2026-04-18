// components/quiz/Quiz.jsx
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../../hooks/useQuiz.js";
import QuestionCard from "./QuestionCard.jsx";
import ScoreView from "./ScoreView.jsx";
import Loader from "../common/Loader.jsx";
import Button from "../common/Button.jsx";
import s from "./Quiz.module.css";

export default function Quiz({ onStreakUpdate }) {
    const navigate = useNavigate();
    const {
        questions, phase, qi, answers, score, result, error,
        pick, next,
    } = useQuiz(onStreakUpdate);

    /* ── Loading ── */
    if (phase === "loading") {
        return <Loader large text="AI is crafting 15 quiz questions from today's news…" />;
    }

    /* ── No digest yet ── */
    if (phase === "no-digest") {
        return (
            <div className="placeholder" style={{ marginTop: "1rem" }}>
                <p>Generate today's digest first, then come back to take the quiz.</p>
                <Button onClick={() => navigate("/digest")}>Go to Digest →</Button>
            </div>
        );
    }

    /* ── Error ── */
    if (phase === "error") {
        return (
            <div className="placeholder" style={{ marginTop: "1rem" }}>
                <p style={{ color: "#ff6b6b" }}>⚠ {error ?? "Something went wrong."}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    /* ── Submitting ── */
    if (phase === "submitting") {
        return <Loader large text="Saving your score…" />;
    }

    /* ── Score screen ── */
    if (phase === "scored") {
        return <ScoreView score={score} total={questions.length} result={result} />;
    }

    /* ── Active quiz ── */
    const q = questions[qi];
    const picked = answers[qi];
    const pct = Math.round(((qi + 1) / questions.length) * 100);

    return (
        <div>
            {/* Header */}
            <div className={s.header}>
                <h2 className={s.heading}>Today's Quiz</h2>
                <div className={s.counter}>{qi + 1} / {questions.length}</div>
            </div>

            {/* Progress bar */}
            <div className={s.progressTrack}>
                <div className={s.progressFill} style={{ width: `${pct}%` }} />
            </div>

            {/* Question */}
            <QuestionCard question={q} picked={picked} onPick={pick} />

            {/* Next button — only visible after answering */}
            {picked !== undefined && (
                <div className={s.nextRow}>
                    <Button onClick={next}>
                        {qi + 1 < questions.length ? "Next →" : "See results →"}
                    </Button>
                </div>
            )}
        </div>
    );
}