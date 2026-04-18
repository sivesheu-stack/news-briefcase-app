// components/digest/StoryCard.jsx
import { useState } from "react";
import { formatDate } from "../../utils/helpers.js";
import s from "./StoryCard.module.css";

export default function StoryCard({ story, category, level }) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className={[s.card, "card card--clickable"].join(" ")}
            onClick={() => setOpen((o) => !o)}
        >
            {/* ── Header ── */}
            <div className={s.header}>
                <div className={s.left}>
                    <span className="badge">{category}</span>
                    <h3 className={s.title}>{story.title}</h3>
                    <p className={s.summary}>{story.summary}</p>
                </div>
                <span className={s.chevron}>{open ? "↑" : "↓"}</span>
            </div>

            {/* ── Expanded ── */}
            {open && (
                <div className={s.expanded} onClick={(e) => e.stopPropagation()}>
                    {/* Implication */}
                    <div className={s.implBox}>
                        <span className={s.implLabel}>Key Implication</span>
                        <p className={s.implText}>{story.implication}</p>
                    </div>

                    {/* Jargon — hidden for advanced readers */}
                    {level !== "advanced" && story.jargon?.length > 0 && (
                        <div className={s.jargonBox}>
                            <span className={[s.implLabel, s.jargonLabel].join(" ")}>Jargon explained</span>
                            {story.jargon.map((j, i) => (
                                <p key={i} className={s.jargonLine}>
                                    <strong className={s.term}>{j.term}:</strong>{" "}
                                    <span className={s.def}>{j.definition}</span>
                                </p>
                            ))}
                        </div>
                    )}

                    {/* Source link */}
                    <div className={s.refs}>
                        <span className={[s.implLabel, s.refsLabel].join(" ")}>Source</span>
                        {story.link ? (
                            <a
                                href={story.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={s.link}
                            >
                                ↗ {story.source}
                            </a>
                        ) : (
                            <span className={s.sourceText}>{story.source}</span>
                        )}
                    </div>
                </div>
            )}

            {/* ── Footer ── */}
            <div className={s.footer}>
                <span className={s.footSource}>{story.source}</span>
                <span className={s.footDate}>{formatDate(story.date)}</span>
            </div>
        </div>
    );
}