import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown";
import "./MainStyles.css";

// The list of game rules
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

  const beginGame = async () => {
    try {
      const startedAt = new Date();

      const createResponse = await fetch("http://172.20.10.2:5000/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!createResponse.ok) throw new Error("Failed to create player");

      const playerData = await createResponse.json();
      const playerId = playerData._id;
      sessionStorage.setItem("playerId", playerId);

      await fetch(`http://172.20.10.2:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startedAt: startedAt.toISOString(),
          totalTimeInSeconds: 0
        })
      });

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

  const handleNext = () => {
    setCurrent(prev => Math.min(rules.length - 1, prev + 1));
  };

  return (
    <div className="page-container rules-page">
      <img src="/images/changihome.jpg" alt="Background" className="home-background" />
      <div className="home-overlay" />

      <div className="page-content" style={{ textAlign: "center" }}>
        {showCountdown ? (
          <Countdown onComplete={beginGame} />
        ) : (
          <>
            {current === 0 && (
              <h2 style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                marginBottom: "1.2rem",
                lineHeight: "1.4"
              }}>
                Mmm, what a nice name, {username}!
              </h2>
            )}

            <div style={{
              fontSize: "1.05rem",
              marginBottom: "2rem",
              lineHeight: "1.6",
              minHeight: "160px"
            }}>
              {rules[current]}
            </div>

            {/* Dot indicators */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "24px"
            }}>
              {rules.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrent(index)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: index === current ? "#00c4cc" : "#ccc",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                ></div>
              ))}
            </div>

            {/* If on last rule, show start button */}
            {current === rules.length - 1 && (
              <>
                <div className="rules-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      style={{ marginRight: 8 }}
                    />
                    I have read and agree to the rules.
                  </label>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!agreed}
                  className="rules-start-button"
                >
                  Start Game
                </button>
              </>
            )}

            {/* If NOT last rule → show Continue */}
            {current < rules.length - 1 && (
              <button
                onClick={handleNext}
                className="rules-start-button"
              >
                Continue →
              </button>
            )}

            {/* Back button */}
            <button
              onClick={() => navigate("/getname")}
              className="rules-start-button"
              style={{
                marginTop: "12px",
                background: "linear-gradient(to right, #00c4cc, #4e9cff)"
              }}
            >
              Back
            </button>

            {error && <div style={{ color: "red", marginTop: "16px" }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
