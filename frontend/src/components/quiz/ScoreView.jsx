// components/quiz/ScoreView.jsx
import { useNavigate } from "react-router-dom";
import { scoreLabel } from "../../utils/helpers.js";
import Button from "../common/Button.jsx";
import s from "./ScoreView.module.css";

export default function ScoreView({ score, total, result }) {
    const navigate = useNavigate();
    const pct = Math.round((score / total) * 100);
    const streak = result?.streak ?? { count: 0 };
    const board = result?.leaderboard ?? [];

    return (
        <div className={s.wrap}>
            {/* Score ring */}
            <div className={s.ring}>
                <span className={s.num}>{score}</span>
                <span className={s.den}>/ {total}</span>
            </div>

            <h2 className={s.verdict}>{scoreLabel(pct)}</h2>
            <p className={s.sub}>{score} of {total} correct · {pct}%</p>

            {/* Streak */}
            {streak.count > 0 && (
                <div className={s.streakBox}>
                    <div className={s.streakNum}>★ {streak.count}</div>
                    <div className={s.streakLabel}>
                        {streak.count === 1 ? "day streak — great start!" : "day streak — keep it going!"}
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            {board.length > 0 && (
                <div className={s.board}>
                    <div className="label" style={{ marginBottom: 10, textAlign: "left" }}>
                        Consistency Leaderboard
                    </div>
                    {board.map((entry, i) => (
                        <div
                            key={entry.id ?? i}
                            className={[s.row, entry.isYou ? s.you : ""].join(" ")}
                        >
                            <span className={[s.rank, i === 0 ? s.rankFirst : ""].join(" ")}>{i + 1}</span>
                            <span className={s.name}>{entry.name}</span>
                            <span className={s.entryStreak}>★ {entry.streak}d</span>
                        </div>
                    ))}
                </div>
            )}

            <div className={s.actions}>
                <Button onClick={() => navigate("/digest")} variant="ghost">← Back to digest</Button>
                <Button onClick={() => window.location.reload()}>Retake quiz</Button>
            </div>
        </div>
    );
}