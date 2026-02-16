import "./Toggle.css";

function Toggle({ isChecked, handleChange, text }) {
    return (
        <div className="toggle-container">
            <input
                type="checkbox"
                id="check"
                className="toggle"
                onChange={handleChange}
                checked={isChecked}
            />
            <label htmlFor="check">
                {text}
                <span className="pill" aria-hidden="true" />
            </label>
        </div>
    );
}

export default Toggle;