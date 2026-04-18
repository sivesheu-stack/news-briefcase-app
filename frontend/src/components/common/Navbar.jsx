// components/common/Navbar.jsx
import { NavLink } from "react-router-dom";
import s from "./Navbar.module.css";

const TABS = [
    { to: "/digest", label: "Digest" },
    { to: "/quiz", label: "Quiz" },
    { to: "/journal", label: "Journal" },
    { to: "/settings", label: "Settings" },
];

export default function Navbar({ streak = 0 }) {
    return (
        <nav className={s.nav}>
            <div className={s.logo}>
                <span className={s.dot} />
                Briefcase
            </div>

            <div className={s.tabs}>
                {TABS.map((t) => (
                    <NavLink
                        key={t.to}
                        to={t.to}
                        className={({ isActive }) => [s.tab, isActive ? s.active : ""].join(" ")}
                    >
                        {t.label}
                    </NavLink>
                ))}
            </div>

            {streak > 0 && (
                <div className={s.streak}>★ {streak}d</div>
            )}
        </nav>
    );
}