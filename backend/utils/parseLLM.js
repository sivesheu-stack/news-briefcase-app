// utils/parseLLM.js
import logger from "./logger.js";

function clean(text = "") {
    let s = text.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
    const objIdx = s.indexOf("{");
    const arrIdx = s.indexOf("[");
    if (objIdx === -1 && arrIdx === -1) return s;
    let start;
    if (objIdx === -1) start = arrIdx;
    else if (arrIdx === -1) start = objIdx;
    else start = Math.min(objIdx, arrIdx);
    return s.slice(start);
}

export function parseLLMJson(text, expectedType = "object") {
    try {
        const parsed = JSON.parse(clean(text));
        if (expectedType === "array" && !Array.isArray(parsed)) {
            return parsed.questions ?? parsed.items ?? null;
        }
        if (expectedType === "object" && Array.isArray(parsed)) return null;
        return parsed;
    } catch (err) {
        logger.error(`parseLLMJson failed: ${err.message}`);
        return null;
    }
}
