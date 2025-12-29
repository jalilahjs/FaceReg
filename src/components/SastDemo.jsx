import React, { useMemo, useState } from "react";

export default function SastDemo() {
    const [userInput, setUserInput] = useState("");

    // ✅ Safe data usage (no code execution)
    const safePreview = useMemo(() => {
        return userInput;
    }, [userInput]);

    // ✅ Safe DOM update
    const writeToDomSafely = () => {
        const el = document.getElementById("preview");
        if (el) {
            el.textContent = userInput;
        }
    };

    return (
        <div style={{ padding: 16 }}>
            <h2>SAST Demo Component (Fixed)</h2>

            <label>
                User Input:
                <input
                    style={{ display: "block", width: "100%", marginTop: 8 }}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                />
            </label>

            <button style={{ marginTop: 12 }} onClick={writeToDomSafely}>
                Update Preview Safely
            </button>

            <div style={{ marginTop: 12 }}>
                <strong>Safe Preview:</strong>
                <div
                    id="preview"
                    style={{ border: "1px solid #ddd", padding: 8, marginTop: 6 }}
                >
                    {safePreview}
                </div>
            </div>
        </div>
    );
}
