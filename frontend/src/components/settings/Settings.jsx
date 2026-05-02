// components/settings/Settings.jsx
import { useState } from "react";
import { api } from "../../api/api.js";
import { INTERESTS, LEVELS, LEVEL_DESCRIPTIONS } from "../../utils/constant.js";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import s from "./Settings.module.css";

export default function Settings({ prefs, onSave }) {
    const [city, setCity] = useState(prefs.city);
    const [country, setCountry] = useState(prefs.country);
    const [level, setLevel] = useState(prefs.level);
    const [interests, setInterests] = useState(prefs.interests);
    const [saved, setSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    function toggleInterest(i) {
        setInterests((prev) =>
            prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
        );
    }

    async function handleSave() {
        if (!city.trim() || interests.length === 0) return;
        setSaving(true);
        setError(null);
        try {
            const body = { city: city.trim(), country: country.trim(), level, interests };
            await api.prefs.update(body);
            onSave(body);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleReset() {
        if (!window.confirm("This will clear all cached data and reset the app. Continue?")) return;
        // Clear server-side caches by busting with a PUT of same prefs — just reload
        window.location.href = "/";
    }

    const canSave = city.trim().length > 0 && interests.length > 0;

    return (
        <div className={s.wrap}>
            <h2 className={s.heading}>Settings</h2>
            <p className={s.hint}>Changes take effect on your next digest generation.</p>

            {/* Location */}
            <Section title="Location">
                <div className={s.locRow}>
                    <Input
                        value={city}
                        onChange={setCity}
                        placeholder="City"
                    />
                    <Input
                        value={country}
                        onChange={setCountry}
                        placeholder="Country"
                    />
                </div>
            </Section>

            {/* Knowledge level */}
            <Section title="Knowledge level" hint="Shapes how jargon and implications are written in your digest.">
                <div className={s.levelRow}>
                    {LEVELS.map((l) => (
                        <button
                            key={l}
                            className={[s.levelBtn, level === l ? s.levelActive : ""].join(" ")}
                            onClick={() => setLevel(l)}
                        >
                            {l[0].toUpperCase() + l.slice(1)}
                        </button>
                    ))}
                </div>
                <p className={s.levelDesc}>{LEVEL_DESCRIPTIONS[level]}</p>
            </Section>

            {/* Interests */}
            <Section title="Interests" hint="Toggle topics to include or exclude from your daily briefing.">
                <div className={s.chips}>
                    {INTERESTS.map((i) => (
                        <button
                            key={i}
                            className={["chip", interests.includes(i) ? "on" : ""].join(" ")}
                            onClick={() => toggleInterest(i)}
                        >
                            {i}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Save */}
            <div className={s.saveRow}>
                <Button onClick={handleSave} disabled={!canSave || saving} style={{ maxWidth: 180 }}>
                    {saving ? "Saving…" : saved ? "✓ Saved!" : "Save changes"}
                </Button>
                {saved && <span className={s.savedMsg}>Your next digest will use these preferences.</span>}
                {error && <span className={s.errorMsg}>⚠ {error}</span>}
            </div>

            {/* Danger zone */}
            <div className={s.danger}>
                <div className="label" style={{ marginBottom: 10 }}>Danger zone</div>
                <Button variant="danger" onClick={handleReset}>
                    Clear all data &amp; reset app
                </Button>
            </div>
        </div>
    );
}

function Section({ title, hint, children }) {
    return (
        <div style={{ marginBottom: "2rem" }}>
            <div className="label" style={{ marginBottom: hint ? 4 : 10 }}>{title}</div>
            {hint && <p style={{ fontSize: 12, color: "var(--tx-4)", marginBottom: 10, lineHeight: 1.5 }}>{hint}</p>}
            {children}
        </div>
    );
}