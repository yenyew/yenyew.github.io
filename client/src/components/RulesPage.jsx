import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown"; // adjust path if needed

const rules = [
  "Now let's go through some ground rules. Take your time to read them carefully, as your game timer has not started yet.",
  "Your game is a trail of 12 clues with scheduled break(s) in between. You will receive clues one at a time. Only one answer is accepted for each clue, so answer carefully!",
  "Your game will be timed. Each incorrect answer adds a penalty of 5 minutes to your final timing, so answer carefully! Hints are available, but at a cost. The timer will be paused during breaks, so you can properly relax.",
  "Stay in public spaces, blend into your environment, and be discreet in your discussions. You do not need to enter any fenced premises or private property unless specifically asked to. Send in your selfies during the game to earn bonus time deduction and have a chance to win our Selfie of the Month contest."
];

export default function RulesPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);


  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    if (!storedUsername) {
      navigate("/getname");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handlePrev = () => setCurrent((c) => Math.max(0, c - 1));
  const handleNext = () => setCurrent((c) => Math.min(rules.length - 1, c + 1));

  const beginGame = async () => {
    try {
      const startedAt = new Date();

      // Step 1: Create the player
      const createResponse = await fetch("http://localhost:5000/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!createResponse.ok) throw new Error("Failed to create player");

      const playerData = await createResponse.json();
      const playerId = playerData._id;
      sessionStorage.setItem("playerId", playerId);

      // Step 2: Patch player with start info
      const patchResponse = await fetch(`http://localhost:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: startedAt.toISOString(),
          totalTimeInSeconds: 0
        })
      });

      if (!patchResponse.ok) throw new Error("Failed to patch player with start time");

      // Step 3: Navigate to game
      navigate("/game");

    } catch (err) {
      console.error(err);
      setError("There was an error starting the game. Please try again.");
    }
  };

  const handleStart = () => {
    if (agreed && username) {
      setShowCountdown(true);
    }
  };

  return (
    <div className="form-container" style={{ maxWidth: 500, margin: "32px auto", textAlign: "center" }}>
      {showCountdown && <Countdown onComplete={beginGame} />}

      {!showCountdown && (
        <>
          {current === 0 && <h2>Mmm, what a nice name, {username}!</h2>}
          <div style={{ minHeight: 120, margin: "24px 0" }}>
            <p>{rules[current]}</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 24 }}>
            <button onClick={handlePrev} disabled={current === 0}>&larr;</button>
            <span>{current + 1} / {rules.length}</span>
            <button onClick={handleNext} disabled={current === rules.length - 1}>&rarr;</button>
          </div>

          {current === rules.length - 1 && (
            <div style={{ marginBottom: 24 }}>
              <label>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                I have read and agree to the rules.
              </label>
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={current !== rules.length - 1 || !agreed}
            style={{
              padding: "12px 32px",
              fontSize: "16px",
              backgroundColor: agreed && current === rules.length - 1 ? "#007bff" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: agreed && current === rules.length - 1 ? "pointer" : "not-allowed",
              width: "100%",
              maxWidth: "300px",
            }}
          >
            Start Game
          </button>

          {error && <div style={{ color: "red", marginTop: "16px" }}>{error}</div>}
        </>
      )}
    </div>
  );
}