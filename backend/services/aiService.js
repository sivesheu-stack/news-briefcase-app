// services/aiService.js
import axios from "axios";

export async function generateSummary(articles, level, interests) {
    const text = articles.map(a =>
        `Title: ${a.title}\nDesc: ${a.desc}`
    ).join("\n\n");

    const prompt = `
Level: ${level}
Interests: ${interests.join(",")}

Summarise into structured JSON:
{
 "sections":[
   {
     "category":"string",
     "stories":[
       {
         "title":"string",
         "summary":"string",
         "implication":"string"
       }
     ]
   }
 ]
}

${text}
`;

    const res = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: prompt }]
        },
        {
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.ANTHROPIC_KEY
            }
        }
    );

    const raw = res.data.content[0].text;
    return JSON.parse(raw.replace(/```json|```/g, ""));
}