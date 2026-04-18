// components/common/Loader.jsx
export default function Loader({ text = "", large = false }) {
    return (
        <div className="placeholder" style={{ marginTop: "1rem" }}>
            <div className={large ? "spinner spinner--lg" : "spinner"} />
            {text && <p>{text}</p>}
        </div>
    );
}