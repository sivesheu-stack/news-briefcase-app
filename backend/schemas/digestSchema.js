// schemas/digestSchema.js
import { z } from "zod";

export const JargonItem = z.object({
    term: z.string(),
    definition: z.string(),
});

export const Story = z.object({
    title: z.string(),
    summary: z.string(),
    implication: z.string(),
    jargon: z.array(JargonItem).default([]),
    source: z.string(),
    link: z.string(),
    date: z.string().default(""),
});

export const Section = z.object({
    category: z.string(),
    stories: z.array(Story).min(1),
});

export const DigestSchema = z.object({
    sections: z.array(Section).min(1),
});

export function validateDigest(raw) {
    return DigestSchema.safeParse(raw);
}