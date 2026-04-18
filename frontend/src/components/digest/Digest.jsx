// components/digest/Digest.jsx
import { useNavigate } from "react-router-dom";
import { useDigest } from "../../hooks/useDigest.js";
import { todayLabel } from "../../utils/helpers.js";
import AudioPlayer from "./AudioPlayer.jsx";
import StoryCard from "./StoryCard.jsx";
import Loader from "../common/Loader.jsx";
import Button from "../common/Button.jsx";
import s from "./Digest.module.css";

export default function Digest({ prefs }) {
    const { digest, status, error, refresh } = useDigest();
    const navigate = useNavigate();

    const allStories = digest?.sections?.flatMap((sec) => sec.stories ?? []) ?? [];

    return (
        <div>
            {/* ── Page header ── */}
            <div className={s.pageHeader}>
                <div>
                    <h2 className={s.heading}>Today's Briefing</h2>
                    <div className={s.sub}>
                        {todayLabel()} · {prefs.city}, {prefs.country}
                    </div>
                </div>
                <div className={s.headerActions}>
                    {status === "done" && (
                        <>
                            <Button variant="ghost" size="sm" onClick={refresh}>↻ Refresh</Button>
                            {allStories.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={() => navigate("/quiz")}>
                                    Take quiz →
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── States ── */}
            {status === "loading" && (
                <Loader
                    large
                    text="Fetching live feeds from Business Standard, Economic Times, Livemint, Financial Express… then summarising with AI."
                />
            )}

            {status === "error" && (
                <div className="placeholder" style={{ marginTop: "1rem" }}>
                    <p style={{ color: "#ff6b6b" }}>⚠ {error ?? "Could not load today's digest."}</p>
                    <Button onClick={refresh}>Retry</Button>
                </div>
            )}

            {/* ── Audio bar ── */}
            {status === "done" && digest && <AudioPlayer digest={digest} />}

            {/* ── Digest sections ── */}
            {status === "done" && digest?.sections?.map((section, si) => (
                <div key={si}>
                    <div className="sec-label">{section.category}</div>
                    {section.stories?.map((story, i) => (
                        <StoryCard
                            key={i}
                            story={story}
                            category={section.category}
                            level={prefs.level}
                        />
                    ))}
                </div>
            ))}

            {status === "done" && !digest?.sections?.length && (
                <div className="placeholder" style={{ marginTop: "1rem" }}>
                    <p>No stories found for your selected interests. Try adjusting them in Settings.</p>
                    <Button variant="ghost" onClick={() => navigate("/settings")}>Open Settings</Button>
                </div>
            )}
        </div>
    );
}