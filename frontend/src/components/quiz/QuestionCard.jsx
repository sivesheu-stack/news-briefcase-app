// components/quiz/QuestionCard.jsx
import s from "./QuestionCard.module.css";

const LETTERS = ["A", "B", "C", "D"];

export default function QuestionCard({ question, picked, onPick }) {
    return (
        <div className={s.card}>
            <p className={s.question}>{question.q}</p>

            <div className={s.options}>
                {question.opts.map((opt, i) => {
                    let variant = "idle";
                    if (picked !== undefined) {
                        if (i === question.ans) variant = "correct";
                        else if (i === picked) variant = "wrong";
                    }

                    return (
                        <button
                            key={i}
                            className={[s.opt, s[variant]].join(" ")}
                            onClick={() => picked === undefined && onPick(i)}
                            disabled={picked !== undefined && variant === "idle"}
                        >
                            <span className={s.letter}>{LETTERS[i]}</span>
                            {opt}
                        </button>
                    );
                })}
            </div>

            {picked !== undefined && question.explanation && (
                <div className={s.explanation}>
                    <span className={s.why}>Why: </span>
                    {question.explanation}
                </div>
            )}
        </div>
    );
}