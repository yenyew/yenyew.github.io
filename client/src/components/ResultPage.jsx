import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './MainStyles.css';

export default function ResultPage() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const playerId = sessionStorage.getItem("playerId");
    if (!playerId) {
      setError("Session expired. Please start again.");
      setLoading(false);
      return;
    }

    // Get correct answers from sessionStorage
    const storedCorrect = sessionStorage.getItem("correctAnswers");
    const storedTotal = sessionStorage.getItem("totalQuestions");
    
    if (storedCorrect) setCorrectAnswers(parseInt(storedCorrect));
    if (storedTotal) setTotalQuestions(parseInt(storedTotal));

    const fetchPlayer = async () => {
      try {
        const res = await fetch(`http://localhost:5000/players/${playerId}`);
        if (!res.ok) throw new Error("Player not found");
        const data = await res.json();
        setPlayer(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch player data:", err.message);
        sessionStorage.clear();
        setError("Player not found or session expired.");
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [navigate]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const getCurrentDateTime = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-SG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return { formattedDate, formattedTime };
  };

  const handleRedeem = async () => {
    const confirm = window.confirm(
      "🎁 Once you click this, please claim your reward at the booth immediately!"
    );
    if (!confirm) return;
  
    try {
      const res = await fetch(`http://localhost:5000/players/${player._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...player, redeemed: true }),
      });
  
      if (res.ok) {
        setPlayer({ ...player, redeemed: true, redeemedAt: new Date() });
        alert("✅ Marked as redeemed!");
      }
    } catch {
      alert("❌ Error redeeming gift.");
    }
  };

  // Calculate performance percentage
  const getPerformanceMessage = () => {
    if (totalQuestions === 0) return "";
    const percentage = (correctAnswers / totalQuestions) * 100;
    
    if (percentage === 100) return "🏆 Perfect Score! Amazing!";
    if (percentage >= 80) return "🎉 Excellent work!";
    if (percentage >= 60) return "👍 Good job!";
    if (percentage >= 40) return "👌 Not bad!";
    return "🎯 Thanks for playing!";
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>{error}</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "2rem",
            padding: "12px 24px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Go Home
        </button>
      </div>
    );
  }

  const { formattedDate, formattedTime } = getCurrentDateTime();
  const totalTime = player.totalTimeInSeconds || 0;

  return (
    <div className="page-container">
      <img src="/images/waterfall.jpg" alt="Background" className="page-background" />
      <div className="page-overlay" />

      <div className="page-content" style={{ textAlign: "center" }}>
        <h2>🎉 Congratulations {player.username}!</h2>
        <p>You have completed the quest with these stats:</p>

        <div style={{ 
          margin: "1.5rem 0", 
          lineHeight: "1.8",
          background: "rgba(255, 255, 255, 0.1)",
          padding: "20px",
          borderRadius: "10px",
          backdropFilter: "blur(5px)"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#2e7d32" }}>
            ✅ Correct Answers: {correctAnswers}/{totalQuestions}
          </div>
          <div style={{ fontSize: "16px", marginBottom: "15px", color: "#1976d2" }}>
            {getPerformanceMessage()}
          </div>
          <div><strong>Total Time (with penalties):</strong> {formatTime(totalTime)}</div>
          <div><strong>Hints Used:</strong> {player.hintsUsed || 0}</div>
          <div><strong>Questions Skipped:</strong> {player.questionsSkipped || 0}</div>
          <div><strong>Wrong Attempts:</strong> {player.wrongAnswers || 0}</div>
        </div>

        <div className="button-group">
          <button className="leaderboard-button" onClick={() => navigate("/leaderboard")}>
            Leaderboard
          </button>
        </div>

        <p style={{ fontWeight: "bold", marginTop: "2rem" }}>
          🎁 Redeem your gift at the booth now!
        </p>

        {!player.redeemed ? (
          <button
            onClick={handleRedeem}
            className="login-btn"
            style={{ marginTop: "1rem" }}
          >
            🎁 Click here to redeem
          </button>
        ) : (
          <p style={{ color: "green", fontWeight: "bold", marginTop: "1rem" }}>
            ✅ Already Redeemed at {new Date(player.redeemedAt).toLocaleString("en-SG")}
          </p>
        )}

        <p style={{ marginTop: "2rem" }}>{formattedDate}, {formattedTime}</p>
      </div>
    </div>
  );
}