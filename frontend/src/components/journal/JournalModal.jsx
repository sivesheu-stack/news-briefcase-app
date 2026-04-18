// components/journal/JournalModal.jsx
import { useState } from "react";
import { MOODS } from "../../utils/constants.js";
import Button from "../common/Button.jsx";
import s from "./JournalModal.module.css";

export default function JournalModal({ onSave, onClose }) {
    const [text, setText] = useState("");
    const [mood, setMood] = useState(MOODS[0]);

    function handleSave() {
        if (!text.trim()) return;
        onSave({ text: text.trim(), mood });
    }

    return (
        <div className={s.overlay} onClick={onClose}>
            <div className={s.modal} onClick={(e) => e.stopPropagation()}>
                <h3 className={s.title}>New thought</h3>

                <textarea
                    className={s.textarea}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Jot down your rough idea or opinion…"
                    autoFocus
                    rows={5}
                />

                {/* Mood picker */}
                <div className={s.moodRow}>
                    <span className={s.moodLabel}>Mood</span>
                    <div className={s.moods}>
                        {MOODS.map((m) => (
                            <button
                                key={m}
                                className={[s.moodBtn, mood === m ? s.moodActive : ""].join(" ")}
                                onClick={() => setMood(m)}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={s.actions}>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!text.trim()}>Save</Button>
                </div>
            </div>
        </div>
    );
}