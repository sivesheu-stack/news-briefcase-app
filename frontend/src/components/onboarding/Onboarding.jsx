// components/onboarding/Onboarding.jsx
import { useState } from "react";
import { api } from "../../api/api.js";
import { INTERESTS, LEVELS, LEVEL_DESCRIPTIONS } from "../../utils/constant.js";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import s from "./Onboarding.module.css";

export default function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("India");
    const [level, setLevel] = useState("intermediate");
    const [interests, setInterests] = useState(["Finance & Markets", "Economics", "Corporate News"]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    function toggleInterest(i) {
        setInterests((prev) =>
            prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
        );
    }

    async function finish() {
        setSaving(true);
        setError(null);
        try {
            const body = { city: city.trim(), country: country.trim(), level, interests };
            await api.prefs.create(body);
            onComplete(body);
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    }

    const STEPS = [
        {
            title: "Where are you based?",
            sub: "We'll localise your briefing to your region.",
            ok: city.trim().length > 0,
            body: (
                <div className={s.locRow}>
                    <Input value={city} onChange={setCity} placeholder="City" autoFocus />
                    <Input value={country} onChange={setCountry} placeholder="Country" />
                </div>
            ),
        },
        {
            title: "Your financial knowledge level?",
            sub: "This shapes how the digest explains news. Change it anytime in Settings.",
            ok: true,
            body: (
                <div>
                    {LEVELS.map((l) => (
                        <button
                            key={l}
                            className={[s.levelCard, level === l ? s.levelActive : ""].join(" ")}
                            onClick={() => setLevel(l)}
                        >
                            <div className={s.levelName}>{l[0].toUpperCase() + l.slice(1)}</div>
                            <div className={s.levelDesc}>{LEVEL_DESCRIPTIONS[l]}</div>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "What topics interest you?",
            sub: "Pick everything you'd like in your briefing. Adjust anytime in Settings.",
            ok: interests.length > 0,
            body: (
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
            ),
        },
    ];

    const cur = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div className={s.screen}>
            <div className={s.card}>
                {/* Progress dots */}
                <div className={s.dots}>
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={s.dot}
                            style={{
                                width: i === step ? 24 : 8,
                                background: i <= step ? "var(--red)" : "var(--bd-2)",
                            }}
                        />
                    ))}
                </div>

                <h2 className={s.title}>{cur.title}</h2>
                <p className={s.sub}>{cur.sub}</p>

                <div className={s.body}>{cur.body}</div>

                {error && <p className={s.error}>⚠ {error}</p>}

                <div className={s.nav}>
                    {step > 0 && (
                        <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>← Back</Button>
                    )}
                    <Button
                        onClick={isLast ? finish : () => setStep((s) => s + 1)}
                        disabled={!cur.ok || saving}
                        style={{ flex: 2 }}
                    >
                        {saving ? "Setting up…" : isLast ? "Start reading →" : "Continue →"}
                    </Button>
                </div>

                <p className={s.step}>Step {step + 1} of {STEPS.length}</p>
            </div>
        </div>
    );
}