// src/hooks/useQuiz.js
import { useState, useEffect, useCallback } from "react";
import { api } from "../api/api.js";

/**
 * Manages the full quiz lifecycle:
 * loading → answering → submitting → scored
 */
export function useQuiz(onStreakUpdate) {
    const [questions, setQuestions] = useState([]);
    const [phase, setPhase] = useState("loading"); // loading | quiz | submitting | scored | error | no-digest
    const [qi, setQi] = useState(0);         // current question index
    const [answers, setAnswers] = useState({});        // { [qi]: chosenIndex }
    const [score, setScore] = useState(0);
    const [result, setResult] = useState(null);      // { streak, leaderboard }
    const [error, setError] = useState(null);

    useEffect(() => {
        api.quiz.generate()
            .then(({ questions: qs }) => { setQuestions(qs); setPhase("quiz"); })
            .catch((err) => {
                if (err.message.includes("digest")) setPhase("no-digest");
                else { setError(err.message); setPhase("error"); }
            });
    }, []);

    const pick = useCallback((optIdx) => {
        if (answers[qi] !== undefined) return; // already answered
        const isCorrect = optIdx === questions[qi].ans;
        setAnswers((prev) => ({ ...prev, [qi]: optIdx }));
        if (isCorrect) setScore((s) => s + 1);
    }, [qi, questions, answers]);

    const next = useCallback(async () => {
        if (qi + 1 >= questions.length) {
            // Last question answered — submit score
            setPhase("submitting");
            try {
                const data = await api.quiz.submit({ score, total: questions.length });
                setResult(data);
                onStreakUpdate?.(data.streak?.count ?? 0);
                setPhase("scored");
            } catch (err) {
                setError(err.message);
                setPhase("error");
            }
        } else {
            setQi((i) => i + 1);
        }
    }, [qi, questions.length, score, onStreakUpdate]);

    return { questions, phase, qi, answers, score, result, error, pick, next };
}