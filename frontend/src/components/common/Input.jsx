// components/common/Input.jsx
import s from "./Input.module.css";

export default function Input({
    value, onChange, placeholder = "", type = "text",
    autoFocus = false, style = {}, label, id,
}) {
    return (
        <div className={s.wrap} style={style}>
            {label && <label className={s.label} htmlFor={id}>{label}</label>}
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={s.input}
            />
        </div>
    );
}