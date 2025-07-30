import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Countdown from "./Countdown";
import AlertModal from "./AlertModal";
import "./MainStyles.css";

export default function RulesPage() {
  const navigate = useNavigate();
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
    setShowCountdown(true);
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
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "bold",
                marginBottom: "1.2rem",
                lineHeight: "1.4",
              }}
            >
              Welcome {username} to <span style={{ color: "#00c4cc" }}>{collectionName}</span>!<br />
              Are you ready to begin?
            </h2>

            <button onClick={handleStart} className="rules-start-button">
              Yes
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