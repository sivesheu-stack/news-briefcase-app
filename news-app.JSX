import { useState, useEffect, useRef } from "react";

// ─── RSS FEED ENDPOINTS ───────────────────────────────────────────────────────
const RSS_SOURCES = {
    "Finance & Markets": [
        { name: "Business Standard — Markets", url: "https://www.business-standard.com/rss/markets-106.rss" },
        { name: "Livemint — Markets", url: "https://livemint.com/rss/markets" },
        { name: "Moneycontrol — Latest", url: "https://www.moneycontrol.com/rss/latestnews.xml" },
        { name: "Economic Times — Markets", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms" },
    ],
    "Corporate News": [
        { name: "Business Standard — Companies", url: "https://www.business-standard.com/rss/companies-101.rss" },
        { name: "Livemint — Companies", url: "https://livemint.com/rss/companies" },
        { name: "Economic Times — Companies", url: "https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms" },
    ],
    "Economics": [
        { name: "Business Standard — Economy", url: "https://www.business-standard.com/rss/economy-102.rss" },
        { name: "Financial Express", url: "https://www.financialexpress.com/feed/" },
        { name: "Economic Times — Economy", url: "https://economictimes.indiatimes.com/news/economy/rssfeeds/1373380680.cms" },
    ],
    "Geopolitics": [
        { name: "Business Standard — World", url: "https://www.business-standard.com/rss/world-news-221.rss" },
        { name: "Livemint — Politics", url: "https://livemint.com/rss/politics" },
        { name: "Hindu BusinessLine", url: "https://www.thehindubusinessline.com/?service=rss" },
    ],
    "Public Policy": [
        { name: "Business Standard — India", url: "https://www.business-standard.com/rss/india-news-216.rss" },
        { name: "Livemint — News", url: "https://livemint.com/rss/news" },
        { name: "Economic Times — Policy", url: "https://economictimes.indiatimes.com/news/economy/policy/rssfeeds/1052732854.cms" },
    ],
    "Tech & Innovation": [
        { name: "Economic Times — Tech", url: "https://economictimes.indiatimes.com/tech/rssfeeds/78570551.cms" },
        { name: "Livemint — Technology", url: "https://livemint.com/rss/technology" },
        { name: "Financial Express — Tech", url: "https://www.financialexpress.com/feed/" },
    ],
    "Energy & Climate": [
        { name: "Business Standard — Industry", url: "https://www.business-standard.com/rss/industry-217.rss" },
        { name: "Economic Times — Energy", url: "https://economictimes.indiatimes.com/industry/energy/rssfeeds/13358755.cms" },
    ],
    "Real Estate": [
        { name: "Business Standard — RE", url: "https://www.business-standard.com/rss/content/real-estate-22310.rss" },
        { name: "Economic Times — RE", url: "https://economictimes.indiatimes.com/industry/services/property-/-cstruction/rssfeeds/13358306.cms" },
    ],
};

const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const INTERESTS_LIST = Object.keys(RSS_SOURCES);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const LS = {
    get: (k, def = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } },
    del: (k) => { try { localStorage.removeItem(k); } catch { } },
};

function parseRSS(xml) {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    return [...doc.querySelectorAll("item")].slice(0, 5).map(item => ({
        title: item.querySelector("title")?.textContent?.trim() || "",
        link: item.querySelector("link")?.textContent?.trim() || "",
        desc: item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "").trim().slice(0, 300) || "",
        pubDate: item.querySelector("pubDate")?.textContent?.trim() || "",
        source: item.closest("channel")?.querySelector("title")?.textContent?.trim() || "",
    }));
}

async function fetchFeed(url) {
    try {
        const res = await fetch(CORS_PROXY + encodeURIComponent(url), { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return [];
        return parseRSS(await res.text());
    } catch { return []; }
}

function fmtDate(str) {
    try { return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
}

function todayLabel() {
    return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function tileColor(i) {
    const p = [
        { bg: "#1a1a2e", accent: "#e94560" }, { bg: "#0f3460", accent: "#e94560" },
        { bg: "#16213e", accent: "#4cc9f0" }, { bg: "#533483", accent: "#e94560" },
        { bg: "#1b4332", accent: "#52b788" }, { bg: "#1d3557", accent: "#a8dadc" },
        { bg: "#3d0000", accent: "#ff6b6b" }, { bg: "#2d3436", accent: "#fdcb6e" },
    ];
    return p[i % p.length];
}

// ─── ANTHROPIC API ─────────────────────────────────────────────────────────────

// ---- helpers ----
function cleanJSON(raw) {
    try {
        const txt = raw.replace(/```json|```/g, "").trim();
        return JSON.parse(txt.slice(txt.indexOf("{")));
    } catch {
        return null;
    }
}

async function withRetry(fn, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === retries) throw e;
        }
    }
}

// ---- core call ----
async function callClaude(prompt, sys = "") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1200,
            system: sys,
            messages: [{ role: "user", content: prompt }]
        }),
    });

    const d = await res.json();
    return d.content?.find(b => b.type === "text")?.text || "";
}

// ---- LEVEL INSTRUCTIONS ----
function levelInstruction(level) {
    if (level === "beginner") {
        return `
- Avoid unexplained jargon
- Explain concepts simply using plain English
- Implications should be intuitive and real-world
`;
    }

    if (level === "intermediate") {
        return `
- Define complex terms briefly in parentheses (max 12 words)
- Keep explanations concise but informative
`;
    }

    return `
- Use full financial terminology
- Focus on macro linkages and second-order effects
- Do not explain basic concepts
`;
}

// ---- SUMMARY GENERATION ----
async function generateSummary(articles, level, interests) {
    const txt = articles
        .map(a => `Source: ${a.source}\nTitle: ${a.title}\nDesc: ${a.desc}`)
        .join("\n\n---\n\n");

    const prompt = `
You are a senior financial analyst writing a high-signal daily briefing.

Your job is NOT to summarise everything.
Your job is to FILTER, PRIORITISE, and EXPLAIN what matters.

LEVEL RULES:
${levelInstruction(level)}

TASK:

1. SELECTION
- Ignore low-signal or repetitive news
- Prioritise:
  - macroeconomic shifts
  - policy changes
  - capital flows
  - major corporate developments
- Maximum 6–8 stories total

2. GROUPING
- Group stories into logical categories

3. FOR EACH STORY:
- title: rewrite into a sharp, information-dense headline
- summary: 2–3 sentences explaining what happened and why it matters
- implication:
  - Must answer: "What should an informed investor infer?"
  - Be specific (rates, liquidity, sectors, risk)
  - Avoid generic statements

4. JARGON
- Include only if not advanced
- Max 2–3 terms per story

5. HARD CONSTRAINTS
- DO NOT invent facts
- DO NOT use outside knowledge
- DO NOT repeat similar stories
- DO NOT output generic implications

6. OUTPUT STRICT JSON:
{
  "sections": [
    {
      "category": "string",
      "stories": [
        {
          "title": "string",
          "summary": "string",
          "implication": "string",
          "jargon": [
            { "term": "string", "definition": "string" }
          ],
          "source": "string",
          "link": "string",
          "date": "string"
        }
      ]
    }
  ]
}

If input is insufficient, return:
{"sections":[]}

INTERESTS: ${interests.join(", ")}

ARTICLES:
${txt}
`;

    return withRetry(async () => {
        const raw = await callClaude(prompt, "Return only raw JSON.");
        const parsed = cleanJSON(raw);

        if (!parsed || !parsed.sections) {
            throw new Error("Invalid LLM output");
        }

        return parsed;
    });
}

// ---- QUIZ GENERATION ----
async function generateQuiz(txt, level) {
    const prompt = `
You are designing a financial comprehension test.

LEVEL: ${level}

TASK:
Generate 5 multiple-choice questions that test:
- understanding of events
- cause-effect relationships
- implications

RULES:
- Avoid trivial recall questions
- Each question must require reasoning
- 4 options per question
- Only one correct answer
- Include explanation

OUTPUT STRICT JSON:
[
  {
    "q": "string",
    "opts": ["A","B","C","D"],
    "ans": 0,
    "explanation": "string"
  }
]

CONTENT:
${txt}
`;

    return withRetry(async () => {
        const raw = await callClaude(prompt, "Return only raw JSON array.");
        const parsed = cleanJSON(raw);

        if (!Array.isArray(parsed)) {
            throw new Error("Invalid quiz output");
        }

        return parsed;
    });
}
// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
function GlobalStyles() {
    return (
        <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #080808; color: #e0e0e0; font-family: 'DM Sans', sans-serif; }
      .wrap  { max-width: 860px; margin: 0 auto; padding: 1.25rem 1rem 4rem; }
      .nav   { display: flex; align-items: center; gap: 6px; padding-bottom: 1.25rem; border-bottom: 1px solid #111; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .logo  { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; flex: 1; display: flex; align-items: center; gap: 8px; min-width: 120px; }
      .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: #e94560; display: inline-block; }
      .tab-btn { padding: 6px 14px; border-radius: 20px; font-size: 13px; cursor: pointer; border: 1px solid transparent; background: transparent; color: #555; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
      .tab-btn:hover { color: #ccc; }
      .tab-btn.active { background: #111; border-color: #1e1e1e; color: #e0e0e0; font-weight: 600; }
      .streak-badge { font-size: 12px; background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 20px; padding: 4px 10px; color: #e94560; white-space: nowrap; }
      .inp   { width: 100%; padding: 9px 14px; font-size: 14px; border: 1px solid #1e1e1e; border-radius: 8px; background: #0d0d0d; color: #e0e0e0; outline: none; font-family: 'DM Sans', sans-serif; transition: border-color 0.15s; }
      .inp:focus { border-color: #333; }
      .level-btn { flex: 1; padding: 9px; font-size: 13px; border: 1px solid #1e1e1e; border-radius: 8px; cursor: pointer; background: transparent; color: #555; text-align: center; transition: all 0.15s; font-family: 'DM Sans', sans-serif; text-transform: capitalize; }
      .level-btn.active { background: #0d0d0d; border-color: #e94560; color: #e94560; font-weight: 600; }
      .chip  { padding: 6px 14px; font-size: 12px; border: 1px solid #1e1e1e; border-radius: 20px; cursor: pointer; background: transparent; color: #555; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
      .chip.selected { background: #0d0d0d; border-color: #e94560; color: #e0e0e0; font-weight: 600; }
      .cta   { width: 100%; padding: 11px; font-size: 14px; font-weight: 600; border-radius: 8px; border: none; background: #e94560; color: #fff; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; display: block; }
      .cta:hover { opacity: 0.87; }
      .cta:disabled { opacity: 0.3; cursor: not-allowed; }
      .ghost { padding: 7px 16px; font-size: 13px; border: 1px solid #222; border-radius: 8px; background: transparent; color: #888; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap; }
      .ghost:hover { border-color: #444; color: #e0e0e0; }
      .audio-bar { background: #0a0a0a; border: 1px solid #161616; border-radius: 10px; padding: 12px 16px; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .play-btn  { width: 38px; height: 38px; border-radius: 50%; border: 1px solid #222; background: #111; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #e0e0e0; flex-shrink: 0; transition: border-color 0.15s; }
      .play-btn:hover { border-color: #e94560; color: #e94560; }
      .vpill { padding: 4px 10px; font-size: 12px; border: 1px solid #1e1e1e; border-radius: 12px; background: transparent; cursor: pointer; color: #555; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
      .vpill.active { background: #111; border-color: #2a2a2a; color: #e0e0e0; font-weight: 600; }
      .sec-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #333; margin: 1.5rem 0 0.75rem; }
      .card  { background: #080808; border: 1px solid #141414; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 10px; cursor: pointer; transition: border-color 0.15s; }
      .card:hover { border-color: #222; }
      .badge { font-size: 10px; font-weight: 700; color: #e94560; background: rgba(233,69,96,0.08); padding: 2px 8px; border-radius: 10px; display: inline-block; }
      .expanded { margin-top: 14px; padding-top: 14px; border-top: 1px solid #141414; }
      .impl-box  { background: rgba(233,69,96,0.05); border: 1px solid rgba(233,69,96,0.12); border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
      .jargon-box{ background: #0d0d0d; border: 1px solid #161616; border-radius: 8px; padding: 10px 12px; margin-bottom: 10px; }
      .spinner   { width: 24px; height: 24px; border: 2px solid #1a1a1a; border-top-color: #e94560; border-radius: 50%; animation: spin 0.8s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ONBOARDING  — shown only once, to new users
// ═══════════════════════════════════════════════════════════════════════════════
function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0);
    const [city, setCity] = useState("");
    const [country, setCountry] = useState("India");
    const [level, setLevel] = useState("intermediate");
    const [interests, setInterests] = useState(["Finance & Markets", "Economics", "Corporate News"]);

    const toggle = i => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

    const STEPS = [
        {
            title: "Where are you based?",
            sub: "We'll localise your briefing to what matters most in your region.",
            body: (
                <div style={{ display: "flex", gap: 10, marginTop: "1.5rem" }}>
                    <input className="inp" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1 }} autoFocus />
                    <input className="inp" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} style={{ flex: 1 }} />
                </div>
            ),
            ok: city.trim().length > 0,
        },
        {
            title: "What's your financial knowledge level?",
            sub: "This shapes how the digest explains news. You can change this anytime in Settings.",
            body: (
                <div style={{ marginTop: "1.5rem" }}>
                    {["beginner", "intermediate", "advanced"].map(l => (
                        <button key={l} onClick={() => setLevel(l)} style={{ display: "block", width: "100%", padding: "13px 18px", marginBottom: 10, border: `1px solid ${level === l ? "#e94560" : "#1e1e1e"}`, borderRadius: 10, background: level === l ? "rgba(233,69,96,0.07)" : "#0a0a0a", color: level === l ? "#e94560" : "#777", textAlign: "left", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3, textTransform: "capitalize" }}>{l}</div>
                            <div style={{ fontSize: 12, color: level === l ? "#e9456088" : "#444" }}>
                                {l === "beginner" && "All jargon explained in plain English with real-world implications."}
                                {l === "intermediate" && "Key terms defined in-line. Expand cards for deeper explanations."}
                                {l === "advanced" && "Full financial terminology. Pure analysis, no hand-holding."}
                            </div>
                        </button>
                    ))}
                </div>
            ),
            ok: true,
        },
        {
            title: "What topics interest you?",
            sub: "Pick everything you'd like in your daily briefing. You can adjust this in Settings later.",
            body: (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "1.5rem" }}>
                    {INTERESTS_LIST.map(i => (
                        <button key={i} onClick={() => toggle(i)} className={`chip ${interests.includes(i) ? "selected" : ""}`}>{i}</button>
                    ))}
                </div>
            ),
            ok: interests.length > 0,
        },
    ];

    const cur = STEPS[step];
    const isLast = step === STEPS.length - 1;

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
            <div style={{ width: "100%", maxWidth: 480 }}>
                {/* progress dots */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: "2.5rem" }}>
                    {STEPS.map((_, i) => (
                        <div key={i} style={{ height: 6, width: i === step ? 24 : 6, borderRadius: 3, background: i <= step ? "#e94560" : "#1e1e1e", transition: "all 0.3s" }} />
                    ))}
                </div>

                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{cur.title}</div>
                <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{cur.sub}</div>

                {cur.body}

                <div style={{ display: "flex", gap: 10, marginTop: "2rem" }}>
                    {step > 0 && <button className="ghost" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>← Back</button>}
                    <button
                        className="cta"
                        style={{ flex: 2, opacity: cur.ok ? 1 : 0.35 }}
                        disabled={!cur.ok}
                        onClick={() => isLast ? onComplete({ city, country, level, interests }) : setStep(s => s + 1)}
                    >
                        {isLast ? "Start reading →" : "Continue →"}
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: 12, color: "#2a2a2a" }}>Step {step + 1} of {STEPS.length}</div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SETTINGS  — accessible via nav tab for returning users
// ═══════════════════════════════════════════════════════════════════════════════
function Settings({ prefs, onSave }) {
    const [city, setCity] = useState(prefs.city);
    const [country, setCountry] = useState(prefs.country);
    const [level, setLevel] = useState(prefs.level);
    const [interests, setInterests] = useState(prefs.interests);
    const [saved, setSaved] = useState(false);

    const toggle = i => setInterests(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

    function save() {
        onSave({ city, country, level, interests });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    const canSave = city.trim().length > 0 && interests.length > 0;

    return (
        <div style={{ maxWidth: 560, margin: "0 auto", paddingTop: "0.5rem" }}>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: "0.4rem" }}>Settings</h2>
            <p style={{ fontSize: 13, color: "#555", marginBottom: "2rem", lineHeight: 1.6 }}>Changes here apply to your next generated digest.</p>

            {/* Location */}
            <SSection title="Location">
                <div style={{ display: "flex", gap: 10 }}>
                    <input className="inp" placeholder="City" value={city} onChange={e => setCity(e.target.value)} style={{ flex: 1 }} />
                    <input className="inp" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} style={{ flex: 1 }} />
                </div>
            </SSection>

            {/* Level */}
            <SSection title="Knowledge level" hint="Changes how jargon and implications are presented in your digest.">
                <div style={{ display: "flex", gap: 8 }}>
                    {["beginner", "intermediate", "advanced"].map(l => (
                        <button key={l} className={`level-btn ${level === l ? "active" : ""}`} onClick={() => setLevel(l)}>{l}</button>
                    ))}
                </div>
                <p style={{ fontSize: 12, color: "#444", marginTop: 8, lineHeight: 1.5 }}>
                    {level === "beginner" && "All jargon explained in plain English with real-world implications."}
                    {level === "intermediate" && "Key terms defined in-line. Expand cards for deeper explanations."}
                    {level === "advanced" && "Full financial terminology. Pure analysis, no hand-holding."}
                </p>
            </SSection>

            {/* Interests */}
            <SSection title="Interests" hint="Toggle topics to include or exclude from your daily briefing.">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {INTERESTS_LIST.map(i => (
                        <button key={i} onClick={() => toggle(i)} className={`chip ${interests.includes(i) ? "selected" : ""}`}>{i}</button>
                    ))}
                </div>
            </SSection>

            {/* Save */}
            <div style={{ borderTop: "1px solid #111", paddingTop: "1.5rem", display: "flex", gap: 12, alignItems: "center" }}>
                <button className="cta" style={{ maxWidth: 180 }} disabled={!canSave} onClick={save}>
                    {saved ? "✓ Saved!" : "Save changes"}
                </button>
                {saved && <span style={{ fontSize: 13, color: "#52b788" }}>Your next digest will use these preferences.</span>}
            </div>

            {/* Danger zone */}
            <div style={{ marginTop: "3rem", borderTop: "1px solid #111", paddingTop: "1.5rem" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#2a2a2a", marginBottom: "1rem" }}>Danger zone</div>
                <button
                    className="ghost"
                    style={{ borderColor: "#3d0000", color: "#ff6b6b" }}
                    onClick={() => {
                        if (window.confirm("This will clear your preferences, digest cache, quiz data, streak, and journal. Are you sure?")) {
                            ["briefcase_prefs", "briefcase_digest_" + new Date().toDateString(), "briefcase_articles_" + new Date().toDateString(), "briefcase_streak", "briefcase_lb", "briefcase_journal"]
                                .forEach(k => localStorage.removeItem(k));
                            window.location.reload();
                        }
                    }}
                >
                    Clear all data &amp; reset app
                </button>
            </div>
        </div>
    );
}

function SSection({ title, hint, children }) {
    return (
        <div style={{ marginBottom: "2rem" }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444", marginBottom: hint ? 4 : 10 }}>{title}</div>
            {hint && <div style={{ fontSize: 12, color: "#3a3a3a", marginBottom: 10, lineHeight: 1.5 }}>{hint}</div>}
            {children}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  DIGEST
// ═══════════════════════════════════════════════════════════════════════════════
function Digest({ prefs, onQuizReady }) {
    const [status, setStatus] = useState("idle");
    const [digest, setDigest] = useState(null);
    const [expanded, setExpanded] = useState({});
    const [voice, setVoice] = useState("female");
    const [playing, setPlaying] = useState(false);
    const [prog, setProg] = useState(0);
    const progTimer = useRef(null);

    useEffect(() => {
        const cached = LS.get("briefcase_digest_" + new Date().toDateString());
        if (cached) { setDigest(cached); setStatus("done"); return; }
        load();
    }, []);

    async function load() {
        setStatus("fetching");
        const sources = prefs.interests.flatMap(i => RSS_SOURCES[i] || []);
        const unique = [...new Map(sources.map(s => [s.url, s])).values()];
        const results = await Promise.allSettled(unique.map(s => fetchFeed(s.url)));
        const seen = new Set();
        const articles = results.flatMap((r, i) =>
            r.status === "fulfilled"
                ? r.value.map(a => ({ ...a, source: unique[i].name, category: prefs.interests.find(int => RSS_SOURCES[int]?.some(x => x.url === unique[i].url)) || "News" }))
                : []
        ).filter(a => { const k = a.title.slice(0, 40).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 30);

        LS.set("briefcase_articles_" + new Date().toDateString(), articles);
        setStatus("summarising");
        const summary = await generateSummary(articles, prefs.level, prefs.interests);
        if (!summary) { setStatus("error"); return; }
        setDigest(summary);
        LS.set("briefcase_digest_" + new Date().toDateString(), summary);
        setStatus("done");
    }

    function buildReadText() {
        if (!digest) return "";
        let t = `Good morning. Here is your daily briefing for ${todayLabel()}. `;
        digest.sections?.forEach(sec => {
            t += `${sec.category}. `;
            sec.stories?.forEach(s => { t += `${s.title}. ${s.summary} Key implication: ${s.implication} `; });
        });
        return t;
    }

    function togglePlay() {
        if (playing) {
            window.speechSynthesis.cancel();
            clearInterval(progTimer.current);
            setPlaying(false); setProg(0); return;
        }
        const utter = new SpeechSynthesisUtterance(buildReadText());
        utter.rate = 0.9;
        const vs = window.speechSynthesis.getVoices();
        const preferred = vs.find(v => voice === "female" ? /samantha|karen|victoria|zira|female/i.test(v.name) : /daniel|alex|david|male/i.test(v.name)) || vs[0];
        if (preferred) utter.voice = preferred;
        utter.onend = () => { setPlaying(false); setProg(0); clearInterval(progTimer.current); };
        window.speechSynthesis.speak(utter);
        setPlaying(true); setProg(0);
        let p = 0;
        progTimer.current = setInterval(() => { p = Math.min(p + 0.3, 99); setProg(p); }, 100);
    }

    const allStories = digest?.sections?.flatMap(s => s.stories || []) || [];

    return (
        <div style={{ paddingTop: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", gap: 12 }}>
                <div>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>Today's Briefing</h2>
                    <div style={{ fontSize: 13, color: "#444", marginTop: 2 }}>{todayLabel()} · {prefs.city}, {prefs.country}</div>
                </div>
                {status === "done" && allStories.length > 0 && (
                    <button className="ghost" onClick={() => onQuizReady(allStories)}>Take quiz →</button>
                )}
            </div>

            {status === "done" && (
                <div className="audio-bar">
                    <button className="play-btn" onClick={togglePlay}>{playing ? "⏸" : "▶"}</button>
                    <div style={{ flex: 1, minWidth: 80 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Read aloud — {playing ? "Playing..." : "Ready"}</div>
                        <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2 }}>
                            <div style={{ height: "100%", width: prog + "%", background: "#e94560", borderRadius: 2, transition: "width 0.1s" }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                        {["female", "male"].map(v => (
                            <button key={v} onClick={() => { if (playing) { window.speechSynthesis.cancel(); clearInterval(progTimer.current); setPlaying(false); setProg(0); } setVoice(v); }} className={`vpill ${voice === v ? "active" : ""}`}>
                                {v[0].toUpperCase() + v.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {status === "idle" && <Placeholder text="Initialising..." />}
            {status === "fetching" && <Placeholder text="Fetching live feeds from Business Standard, Economic Times, Livemint, Financial Express..." spinner />}
            {status === "summarising" && <Placeholder text="AI is reading and summarising today's news for you..." spinner />}
            {status === "error" && (
                <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <div style={{ fontSize: 30, marginBottom: 10 }}>⚠</div>
                    <div style={{ color: "#555", fontSize: 14, marginBottom: 16 }}>Couldn't load today's news. Check your connection.</div>
                    <button className="cta" onClick={load} style={{ maxWidth: 180, margin: "0 auto" }}>Retry</button>
                </div>
            )}

            {status === "done" && digest?.sections?.map((sec, si) => (
                <div key={si}>
                    <div className="sec-label">{sec.category}</div>
                    {sec.stories?.map((story, i) => {
                        const key = `${si}-${i}`;
                        const open = expanded[key];
                        return (
                            <div key={i} className="card" onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                                    <div style={{ flex: 1 }}>
                                        <span className="badge">{sec.category}</span>
                                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, lineHeight: 1.4, margin: "6px 0" }}>{story.title}</h3>
                                        <p style={{ fontSize: 13.5, color: "#999", lineHeight: 1.7 }}>{story.summary}</p>
                                    </div>
                                    <span style={{ fontSize: 14, color: "#333", flexShrink: 0, paddingTop: 4 }}>{open ? "↑" : "↓"}</span>
                                </div>

                                {open && (
                                    <div className="expanded">
                                        <div className="impl-box">
                                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e94560" }}>Key Implication</span>
                                            <p style={{ fontSize: 13, lineHeight: 1.6, marginTop: 4, color: "#ddd" }}>{story.implication}</p>
                                        </div>
                                        {prefs.level !== "advanced" && story.jargon?.length > 0 && (
                                            <div className="jargon-box">
                                                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#444", marginBottom: 8 }}>Jargon explained</div>
                                                {story.jargon.map((j, ji) => (
                                                    <div key={ji} style={{ marginBottom: 5 }}>
                                                        <span style={{ fontWeight: 600, color: "#ccc", fontSize: 13 }}>{j.term}: </span>
                                                        <span style={{ color: "#777", fontSize: 13 }}>{j.definition}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333", marginBottom: 5 }}>Source</div>
                                            <a href={story.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e94560", fontSize: 12 }} onClick={e => e.stopPropagation()}>↗ {story.source}</a>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: "#333" }}>
                                    <span>{story.source}</span>
                                    <span>{fmtDate(story.date)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function Placeholder({ text, spinner }) {
    return (
        <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 12, padding: "2rem", margin: "1rem 0", textAlign: "center" }}>
            {spinner && <div className="spinner" style={{ margin: "0 auto 12px" }} />}
            <div style={{ color: "#555", fontSize: 14 }}>{text}</div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════════════════════════════
function Quiz({ prefs, stories }) {
    const [phase, setPhase] = useState("loading");
    const [questions, setQuestions] = useState([]);
    const [qi, setQi] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (!stories?.length) { setPhase("no-content"); return; }
        const txt = stories.slice(0, 10).map(s => `${s.title}. ${s.summary}`).join("\n");
        generateQuiz(txt, prefs.level).then(qs => { setQuestions(qs); setPhase("quiz"); });
    }, []);

    function pick(idx) {
        if (answers[qi] !== undefined) return;
        if (idx === questions[qi].ans) setScore(s => s + 1);
        setAnswers(p => ({ ...p, [qi]: idx }));
    }

    function next() {
        if (qi + 1 >= questions.length) {
            const tod = new Date().toDateString();
            const yest = new Date(Date.now() - 86400000).toDateString();
            const prev = LS.get("briefcase_streak", { count: 0, last: "" });
            const nxt = prev.last === tod ? prev : prev.last === yest ? { count: prev.count + 1, last: tod } : { count: 1, last: tod };
            LS.set("briefcase_streak", nxt);
            let lb = LS.get("briefcase_lb", []);
            const idx = lb.findIndex(e => e.name === "You");
            if (idx >= 0) lb[idx].streak = nxt.count; else lb.push({ name: "You", streak: nxt.count });
            LS.set("briefcase_lb", lb.sort((a, b) => b.streak - a.streak));
            setPhase("score");
        } else { setQi(qi + 1); }
    }

    const streak = LS.get("briefcase_streak", { count: 0 });
    const lb = [...LS.get("briefcase_lb", [{ name: "You", streak: streak.count }, { name: "Aisha K.", streak: 22 }, { name: "Rohan M.", streak: 18 }, { name: "Priya S.", streak: 14 }])].sort((a, b) => b.streak - a.streak);
    const LETTERS = ["A", "B", "C", "D"];

    if (phase === "loading") return <Placeholder text="AI is generating your quiz from today's news..." spinner />;
    if (phase === "no-content") return <Placeholder text="Generate today's digest first, then come back to take the quiz." />;

    if (phase === "score") {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <div style={{ textAlign: "center", paddingTop: "1.5rem" }}>
                <div style={{ width: 110, height: 110, borderRadius: "50%", border: "3px solid #e94560", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 34, fontWeight: 700, color: "#e94560" }}>{score}</div>
                    <div style={{ fontSize: 12, color: "#444" }}>/ {questions.length}</div>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                    {pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort!" : "Keep reading!"}
                </h2>
                <p style={{ color: "#555", fontSize: 14, marginBottom: "1.5rem" }}>{score} of {questions.length} correct · {pct}%</p>
                <div style={{ background: "#0a0a0a", border: "1px solid #161616", borderRadius: 12, padding: "1.25rem", maxWidth: 320, margin: "0 auto 1.5rem" }}>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 700, color: "#e94560" }}>★ {streak.count}</div>
                    <div style={{ fontSize: 13, color: "#555" }}>day streak — keep it going!</div>
                </div>
                <div style={{ maxWidth: 340, margin: "0 auto" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#333", marginBottom: 10, textAlign: "left" }}>Consistency Leaderboard</div>
                    {lb.slice(0, 6).map((e, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #0d0d0d", fontWeight: e.name === "You" ? 700 : 400, color: e.name === "You" ? "#e0e0e0" : "#666" }}>
                            <span style={{ width: 20, fontSize: 13, color: i === 0 ? "#e94560" : "#333" }}>{i + 1}</span>
                            <span style={{ flex: 1, fontSize: 14 }}>{e.name}</span>
                            <span style={{ fontSize: 13 }}>★ {e.streak}d</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const q = questions[qi];
    const picked = answers[qi];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>Today's Quiz</h2>
                <div style={{ fontSize: 12, background: "#0a0a0a", border: "1px solid #141414", borderRadius: 20, padding: "4px 12px", color: "#444" }}>{qi + 1} / {questions.length}</div>
            </div>
            <div style={{ height: 3, background: "#0d0d0d", borderRadius: 2, marginBottom: "1.5rem" }}>
                <div style={{ height: "100%", width: `${((qi + 1) / questions.length) * 100}%`, background: "#e94560", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <div style={{ background: "#0a0a0a", border: "1px solid #141414", borderRadius: 12, padding: "1.5rem", marginBottom: "1rem" }}>
                <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, lineHeight: 1.5, marginBottom: "1.25rem" }}>{q.q}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.opts.map((opt, i) => {
                        let border = "#1e1e1e", bg = "transparent", col = "#888";
                        if (picked !== undefined) {
                            if (i === q.ans) { bg = "rgba(82,183,136,0.1)"; border = "#52b788"; col = "#52b788"; }
                            else if (i === picked && i !== q.ans) { bg = "rgba(233,69,96,0.1)"; border = "#e94560"; col = "#e94560"; }
                        }
                        return (
                            <button key={i} onClick={() => pick(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: `1px solid ${border}`, borderRadius: 8, background: bg, color: col, cursor: picked === undefined ? "pointer" : "default", textAlign: "left", fontSize: 14, fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s" }}>
                                <span style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid currentColor", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{LETTERS[i]}</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>
                {picked !== undefined && q.explanation && (
                    <div style={{ marginTop: 12, background: "#111", borderRadius: 8, padding: "10px 12px", fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                        <span style={{ fontWeight: 700, color: "#e94560" }}>Why: </span>{q.explanation}
                    </div>
                )}
            </div>
            {picked !== undefined && (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="cta" style={{ maxWidth: 160 }} onClick={next}>{qi + 1 < questions.length ? "Next →" : "See results →"}</button>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  JOURNAL
// ═══════════════════════════════════════════════════════════════════════════════
function Journal() {
    const [entries, setEntries] = useState(() => LS.get("briefcase_journal", [
        { id: 1, date: "Apr 9", text: "Rate cuts could be a great signal for NBFC stocks. Worth tracking housing finance companies closely.", mood: "💡" },
        { id: 2, date: "Apr 7", text: "Geopolitical uncertainty in the Middle East is keeping oil prices elevated. India is very vulnerable given our import dependence.", mood: "🌍" },
        { id: 3, date: "Apr 5", text: "RIL's Jio keeps compounding — are they quietly building a financial super-app? Watch this space.", mood: "🤔" },
        { id: 4, date: "Apr 3", text: "Core inflation stays sticky even as food prices cool. Could be a wage-growth effect. Need to track.", mood: "📊" },
        { id: 5, date: "Apr 1", text: "New FY begins. Government capex push should support infrastructure and defence plays.", mood: "📅" },
        { id: 6, date: "Mar 29", text: "Q4 earnings season — watching IT and banking. Margin trends matter more than revenue this quarter.", mood: "👁" },
    ]));
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState(false);
    const [draft, setDraft] = useState("");
    const [tip, setTip] = useState(null);
    const MOODS = ["💡", "🤔", "📊", "🌍", "📝", "🔍", "⚡", "🎯"];

    function save() {
        if (!draft.trim()) return;
        const dateStr = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        const next = [{ id: Date.now(), date: dateStr, text: draft.trim(), mood: MOODS[Math.floor(Math.random() * MOODS.length)] }, ...entries];
        setEntries(next); LS.set("briefcase_journal", next);
        setDraft(""); setModal(false);
    }

    const filtered = search ? entries.filter(e => e.text.toLowerCase().includes(search.toLowerCase()) || e.date.toLowerCase().includes(search.toLowerCase())) : entries;

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700 }}>Thought Journal</h2>
                <button className="ghost" onClick={() => setModal(true)}>+ New thought</button>
            </div>
            <input className="inp" placeholder="Search by keyword or date..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: "1.25rem" }} />

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
                {filtered.map((entry, i) => {
                    const pal = tileColor(i);
                    return (
                        <div key={entry.id} onMouseEnter={() => setTip(entry.id)} onMouseLeave={() => setTip(null)}
                            style={{ background: pal.bg, borderRadius: 12, padding: 14, minHeight: 120, cursor: "pointer", position: "relative", transition: "transform 0.15s", transform: tip === entry.id ? "translateY(-3px)" : "none", border: `1px solid ${pal.accent}22` }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: pal.accent, marginBottom: 6 }}>{entry.date}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>{entry.text}</div>
                            <div style={{ fontSize: 18, marginTop: 8 }}>{entry.mood}</div>
                            {tip === entry.id && (
                                <div style={{ position: "absolute", bottom: "105%", left: 0, right: 0, background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: 8, padding: "10px 12px", fontSize: 12, color: "#bbb", lineHeight: 1.6, zIndex: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.7)" }}>
                                    {entry.text.slice(0, 140)}{entry.text.length > 140 ? "..." : ""}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div onClick={() => setModal(true)}
                    style={{ background: "#080808", border: "1px dashed #1e1e1e", borderRadius: 12, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#2a2a2a", fontSize: 28, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#e94560"; e.currentTarget.style.color = "#e94560"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#2a2a2a"; }}>+</div>
            </div>

            {modal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
                    <div style={{ background: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: 14, padding: "1.5rem", width: "90%", maxWidth: 460 }}>
                        <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: "1rem" }}>New thought</h3>
                        <textarea value={draft} onChange={e => setDraft(e.target.value)} placeholder="Jot down your rough idea or opinion..." autoFocus
                            style={{ width: "100%", minHeight: 140, background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#ddd", fontFamily: "'DM Sans',sans-serif", resize: "vertical", outline: "none", lineHeight: 1.7 }} />
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                            <button className="ghost" onClick={() => { setModal(false); setDraft(""); }}>Cancel</button>
                            <button className="cta" style={{ maxWidth: 100 }} onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
    const [prefs, setPrefs] = useState(() => LS.get("briefcase_prefs", null));
    const [tab, setTab] = useState("digest");
    const [quizStories, setQuizStories] = useState(null);
    const streak = LS.get("briefcase_streak", { count: 0 });

    // ── NEW USER: show full-screen onboarding, no nav ──────────────────────────
    if (!prefs) {
        return (
            <>
                <GlobalStyles />
                <div style={{ background: "#080808", minHeight: "100vh" }}>
                    <div style={{ maxWidth: 860, margin: "0 auto", padding: "1.25rem 1rem" }}>
                        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e94560", display: "inline-block" }} />Briefcase
                        </div>
                    </div>
                    <Onboarding onComplete={p => { LS.set("briefcase_prefs", p); setPrefs(p); }} />
                </div>
            </>
        );
    }

    // ── RETURNING USER: full shell, Settings replaces Setup ───────────────────
    const TABS = [
        { id: "digest", label: "Digest" },
        { id: "quiz", label: "Quiz" },
        { id: "journal", label: "Journal" },
        { id: "settings", label: "Settings" },
    ];

    return (
        <>
            <GlobalStyles />
            <div style={{ background: "#080808", minHeight: "100vh" }}>
                <div className="wrap">
                    <nav className="nav">
                        <div className="logo"><span className="logo-dot" />Briefcase</div>
                        {TABS.map(t => (
                            <button key={t.id} className={`tab-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
                        ))}
                        {streak.count > 0 && <div className="streak-badge">★ {streak.count}d</div>}
                    </nav>

                    {tab === "digest" && <Digest prefs={prefs} onQuizReady={s => { setQuizStories(s); setTab("quiz"); }} />}
                    {tab === "quiz" && <Quiz prefs={prefs} stories={quizStories} />}
                    {tab === "journal" && <Journal />}
                    {tab === "settings" && (
                        <Settings prefs={prefs} onSave={p => {
                            LS.set("briefcase_prefs", p);
                            setPrefs(p);
                            // Bust digest cache so next visit re-generates with new prefs
                            LS.del("briefcase_digest_" + new Date().toDateString());
                            LS.del("briefcase_articles_" + new Date().toDateString());
                        }} />
                    )}
                </div>
            </div>
        </>
    );
}