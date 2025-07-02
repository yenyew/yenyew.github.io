import React, { useState, useEffect } from "react";
import Countdown from "./Countdown";
import QuestionPage from "./QuestionPage";

export default function EnterUsername() {
  const [form, setForm] = useState({ username: "" });
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("form"); // "form" → "countdown" → "quiz"

  // Load saved username from sessionStorage on mount
  useEffect(() => {
    const savedUsername = sessionStorage.getItem("username");
    if (savedUsername) {
      setForm({ username: savedUsername });
    }
  }, []);

  function updateForm(value) {
    setForm((prev) => ({ ...prev, ...value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.username.trim()) {
      setError("Please enter your name.");
      return;
    }

    sessionStorage.setItem("username", form.username);
    setPhase("countdown");
  }

  if (phase === "countdown") {
    return <Countdown onComplete={() => setPhase("quiz")} />;
  }

  if (phase === "quiz") {
    return <QuestionPage />;
  }

  return (
    <div className="form-container" style={{ maxWidth: 400, margin: "32px auto", textAlign: "center" }}>
      <h2>
        Hi there! Welcome to the Changi<br />
        Experience Studio @ Jewel Changi Airport!
      </h2>
      <p>How should I address you on this journey?</p>
      <form onSubmit={onSubmit}>
        <div className="form-group" style={{ marginBottom: "16px" }}>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your name"
            value={form.username}
            onChange={(e) => updateForm({ username: e.target.value })}
            style={{
              padding: "12px 16px",
              fontSize: "16px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              width: "100%",
              maxWidth: "300px",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          Let's Go
        </button>
        {error && <div style={{ color: "red", marginTop: "16px" }}>{error}</div>}
      </form>
    </div>
  );
}
