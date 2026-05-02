import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { api } from "./api/api.js";
import Nav from "./components/common/Navbar.jsx";
import Onboarding from "./components/onboarding/Onboarding.jsx";
import Digest from "./components/digest/Digest.jsx";
import Quiz from "./components/quiz/Quiz.jsx";
import Journal from "./components/journal/Journal.jsx";
import Settings from "./components/settings/Settings.jsx";

export default function App() {
    const [prefs, setPrefs] = useState(undefined); // undefined = loading
    const [streak, setStreak] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        api.prefs.get()
            .then(p => {
                setPrefs(p);
                if (p) {
                    api.digest.streak().then(s => setStreak(s?.count || 0)).catch(() => { });
                }
            })
            .catch(() => setPrefs(null));
    }, []);

    function handleOnboardingComplete(newPrefs) {
        setPrefs(newPrefs);
        navigate("/digest");
    }

    function handlePrefsUpdate(newPrefs) {
        setPrefs(newPrefs);
    }

    // Still loading
    if (prefs === undefined) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="spinner" />
            </div>
        );
    }

    if (!prefs) {
        return (
            <div style={{ background: "#080808", minHeight: "100vh" }}>
                <div className="wrap">
                    <div style={{ fontFamily: "var(--serif)", fontSize: 20, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, paddingBottom: "1rem" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", display: "inline-block" }} />
                        Briefcase
                    </div>
                </div>
                <Onboarding onComplete={handleOnboardingComplete} />
            </div>
        );
    }

    // Returning user — full shell
    return (
        <div style={{ background: "#080808", minHeight: "100vh" }}>
            <div className="wrap">
                <Nav streak={streak} />
                <Routes>
                    <Route path="/" element={<Navigate to="/digest" replace />} />
                    <Route path="/digest" element={<Digest prefs={prefs} />} />
                    <Route path="/quiz" element={<Quiz prefs={prefs} onStreakUpdate={setStreak} />} />
                    <Route path="/journal" element={<Journal />} />
                    <Route path="/settings" element={<Settings prefs={prefs} onSave={handlePrefsUpdate} />} />
                    <Route path="*" element={<Navigate to="/digest" replace />} />
                </Routes>
            </div>
        </div>
    );
}