// components/common/Button.jsx
import styles from "./Button.module.css";

/**
 * variant: "primary" | "ghost" | "danger"
 * size:    "md" (default) | "sm"
 */
export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    disabled = false,
    fullWidth = false,
    type = "button",
    style = {},
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={[
                styles.btn,
                styles[variant],
                styles[size],
                fullWidth ? styles.full : "",
            ].join(" ")}
            style={style}
        >
            {children}
        </button>
    );
}