import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown";
import AlertModal from "./AlertModal";
import "./MainStyles.css";

const rules = [
  "Let's go through some quick ground rules. Take your time to read — the game timer hasn't started yet, so no rush.",
  "You'll be solving 12 clues, one at a time. Once you submit an answer, you can't change it — so think carefully before hitting submit!",
  "Your game is timed. Each wrong answer adds a 5-minute penalty. Skipping a question adds 10 minutes, and using a hint adds 2 minutes. Hints are optional — use them wisely.",
  "Stick to public areas and stay discreet. You won't need to enter any restricted or private zones unless clearly instructed. Keep your eyes peeled and have fun!"
];

export default function RulesPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [username, setUsername] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [showCountdown, setShowCountdown] = useState(false);

  // Modal state for errors
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const collectionId = sessionStorage.getItem("collectionId");

    if (!storedUsername) {
      navigate("/getname");
      return;
    } else {
      setUsername(storedUsername);
    }

    if (collectionId) {
      fetch("http://localhost:5000/collections")
        .then((res) => res.json())
        .then((data) => {
          const match = data.find((col) => col._id === collectionId);
          if (match) setCollectionName(match.name);
        })
        .catch((err) => console.error("Error fetching collection name:", err));
    }
  }, [navigate]);

  const beginGame = async () => {
    const collectionId = sessionStorage.getItem("collectionId");
    if (!collectionId) {
      setModalTitle("Missing Collection");
      setModalMessage("Please enter your code again.");
      setShowErrorModal(true);
      return;
    }

    try {
      const startedAt = new Date().toISOString();
      const createRes = await fetch("http://localhost:5000/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, collectionId }),
      });
      if (!createRes.ok) {
        const msg = await createRes.text();
        throw new Error(msg || "Player creation failed.");
      }
      const { _id: playerId } = await createRes.json();
      sessionStorage.setItem("playerId", playerId);

      await fetch(`http://localhost:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startedAt, totalTimeInSeconds: 0, collectionId }),
      });

      navigate("/game");
    } catch (err) {
      console.error(err);
      setModalTitle("Error Starting Game");
      setModalMessage("There was an error starting the game. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleStart = () => {
    if (agreed && username) {
      setShowCountdown(true);
    }
  };

  const handleNext = () => {
    setCurrent((prev) => Math.min(rules.length - 1, prev + 1));
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
                Mmm, what a nice name, {username}!<br />
                Welcome to <span style={{ color: "#00c4cc" }}>{collectionName}</span>!
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

            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "24px"
            }}>
              {rules.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: idx === current ? "#00c4cc" : "#ccc",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                />
              ))}
            </div>

            {current === rules.length - 1 ? (
              <>
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                  fontSize: "1rem"
                }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    style={{
                      marginTop: "15px",
                      width: "18px",
                      height: "18px",
                      cursor: "pointer"
                    }}
                  />
                  <label style={{ cursor: "pointer" }}>
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
            ) : (
              <button
                onClick={handleNext}
                className="rules-start-button"
              >
                Continue →
              </button>
            )}

            <button
              onClick={() => navigate("/getname")}
              className="rules-start-button"
              style={{
                marginTop: "40px",
                background: "linear-gradient(to right, #00c4cc, #4e9cff)"
              }}
            >
              Return
            </button>
          </>
        )}
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="error"
        showCancel={false}
      />
    </div>
  );
}
