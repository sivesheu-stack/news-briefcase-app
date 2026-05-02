// schemas/quizSchema.js
import { z } from "zod";

export const Question = z.object({
    q: z.string().min(5),
    opts: z.array(z.string()).length(4),
    ans: z.number().int().min(0).max(3),
    explanation: z.string(),
});

export const QuizSchema = z.array(Question).min(1).max(15);

export function validateQuiz(raw) {
    return QuizSchema.safeParse(raw);
}
