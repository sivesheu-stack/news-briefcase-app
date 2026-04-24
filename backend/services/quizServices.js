// services/quizService.js
import axios from "axios";

export async function generateQuiz(text, level) {
    const prompt = `
Generate 15 MCQs based on this:
${text}

Return JSON:
[ { "q": "", "opts": [], "ans": 0 } ]
`;

    const res = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
            model: "claude-sonnet-4-20250514",
            max_tokens: 800,
            messages: [{ role: "user", content: prompt }]
        },
        {
            headers: {
                "x-api-key": process.env.ANTHROPIC_KEY
            }
        }
    );

    return JSON.parse(res.data.content[0].text);
}