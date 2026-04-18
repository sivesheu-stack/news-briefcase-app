// components/journal/Journal.jsx
import { useState, useEffect } from "react";
import { api } from "../../api/api.js";
import { tileColor } from "../../utils/helpers.js";
import JournalModal from "./JournalModal.jsx";
import Input from "../common/Input.jsx";
import Button from "../common/Button.jsx";
import Loader from "../common/Loader.jsx";
import s from "./Journal.module.css";

export default function Journal() {
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [tooltip, setTooltip] = useState(null); // hovered entry id

    // Load entries from backend
    async function load(q = "") {
        setLoading(true);
        try {
            const data = await api.journal.list(q);
            setEntries(data);
        } catch {
            /* silently keep current state */
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => load(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    async function handleSave({ text, mood }) {
        try {
            const entry = await api.journal.create({ text, mood });
            setEntries((prev) => [entry, ...prev]);
            setModal(false);
        } catch { /* noop */ }
    }

    async function handleDelete(id, e) {
        e.stopPropagation();
        await api.journal.remove(id).catch(() => { });
        setEntries((prev) => prev.filter((en) => en.id !== id));
    }

    return (
        <div>
            {/* Toolbar */}
            <div className={s.toolbar}>
                <h2 className={s.heading}>Thought Journal</h2>
                <Button size="sm" onClick={() => setModal(true)}>+ New thought</Button>
            </div>

            <div className={s.searchWrap}>
                <Input
                    value={search}
                    onChange={setSearch}
                    placeholder="Search by keyword or date…"
                />
            </div>

            {/* Grid */}
            {loading ? (
                <Loader text="Loading journal…" />
            ) : (
                <div className={s.grid}>
                    {entries.map((entry, i) => {
                        const pal = tileColor(i);
                        return (
                            <div
                                key={entry.id}
                                className={s.tile}
                                style={{ background: pal.bg, borderColor: pal.accent + "22" }}
                                onMouseEnter={() => setTooltip(entry.id)}
                                onMouseLeave={() => setTooltip(null)}
                            >
                                {/* Hover tooltip */}
                                {tooltip === entry.id && (
                                    <div className={s.tooltip}>
                                        {entry.text.length > 140 ? entry.text.slice(0, 140) + "…" : entry.text}
                                    </div>
                                )}

                                <div className={s.tileDate} style={{ color: pal.accent }}>{entry.date}</div>
                                <div className={s.tileText}>{entry.text}</div>
                                <div className={s.tileFooter}>
                                    <span className={s.tileMood}>{entry.mood}</span>
                                    <button
                                        className={s.delBtn}
                                        onClick={(e) => handleDelete(entry.id, e)}
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add tile */}
                    <div
                        className={[s.tile, s.addTile].join(" ")}
                        onClick={() => setModal(true)}
                    >
                        <span className={s.addIcon}>+</span>
                    </div>
                </div>
            )}

            {!loading && entries.length === 0 && !search && (
                <div className="placeholder">
                    <p>No thoughts yet. Hit "+ New thought" to start your journal.</p>
                </div>
            )}

            {!loading && entries.length === 0 && search && (
                <div className="placeholder">
                    <p>No entries match "{search}".</p>
                </div>
            )}

            {modal && (
                <JournalModal onSave={handleSave} onClose={() => setModal(false)} />
            )}
        </div>
    );
}