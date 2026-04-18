// components/digest/AudioPlayer.jsx
import { useState, useRef, useEffect } from "react";
import { buildReadAloudText } from "../../utils/helpers.js";
import s from "./AudioPlayer.module.css";

export default function AudioPlayer({ digest }) {
    const [playing, setPlaying] = useState(false);
    const [voice, setVoice] = useState("female");
    const [progress, setProgress] = useState(0);
    const timerRef = useRef(null);

    // Stop speech if component unmounts
    useEffect(() => () => {
        window.speechSynthesis?.cancel();
        clearInterval(timerRef.current);
    }, []);

    function stop() {
        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);
        setPlaying(false);
        setProgress(0);
    }

    function play() {
        if (!window.speechSynthesis) return;
        const text = buildReadAloudText(digest);
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.9;
        utter.pitch = 1;

        // Pick voice by gender preference
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find((v) =>
            voice === "female"
                ? /samantha|karen|victoria|zira|female/i.test(v.name)
                : /daniel|alex|david|james|male/i.test(v.name)
        ) ?? voices[0];
        if (preferred) utter.voice = preferred;

        utter.onend = stop;
        window.speechSynthesis.speak(utter);
        setPlaying(true);
        setProgress(0);

        let p = 0;
        timerRef.current = setInterval(() => {
            p = Math.min(p + 0.28, 99);
            setProgress(p);
        }, 100);
    }

    function togglePlay() {
        if (playing) stop(); else play();
    }

    function switchVoice(v) {
        if (playing) stop();
        setVoice(v);
    }

    return (
        <div className={s.bar}>
            <button className={s.playBtn} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                {playing ? "⏸" : "▶"}
            </button>

            <div className={s.info}>
                <div className={s.title}>{playing ? "Reading digest aloud…" : "Read aloud — tap to listen"}</div>
                <div className={s.track}>
                    <div className={s.fill} style={{ width: `${progress}%` }} />
                </div>
            </div>

            <div className={s.voices}>
                {["female", "male"].map((v) => (
                    <button
                        key={v}
                        className={[s.vpill, voice === v ? s.vpillActive : ""].join(" ")}
                        onClick={() => switchVoice(v)}
                    >
                        {v[0].toUpperCase() + v.slice(1)}
                    </button>
                ))}
            </div>
        </div>
    );
}