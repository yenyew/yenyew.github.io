import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SharePage() {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const playerId = sessionStorage.getItem("playerId");
    if (!playerId) {
      navigate("/getname");
      return;
    }

    // Helper to update finishedAt and totalTimeInSeconds
    const endGame = async (playerData) => {
      if (!playerData.finishedAt) {
        const finishedAt = new Date();
        const startedAt = new Date(playerData.startedAt);
        const totalTimeInSeconds = Math.floor((finishedAt - startedAt) / 1000);

        // PATCH the player record
        await fetch(`http://localhost:5000/players/${playerId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            finishedAt,
            totalTimeInSeconds,
          }),
        });

        // Update local state
        setPlayer({
          ...playerData,
          finishedAt,
          totalTimeInSeconds,
        });
      }
    };

    const fetchPlayer = async () => {
      try {
        const res = await fetch(`http://localhost:5000/players/${playerId}`);
        const data = await res.json();
        setPlayer(data);
        setLoading(false);

        // Only update if not already finished
        if (!data.finishedAt) {
          endGame(data);
        }
      } catch (err) {
        console.error("Failed to fetch player data:", err);
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
      year: "numeric", month: "long", day: "numeric"
    });
    const formattedTime = date.toLocaleTimeString("en-SG", {
      hour: "2-digit", minute: "2-digit", hour12: false
    });
    return { formattedDate, formattedTime };
  };

  if (loading || !player) return <p style={{ textAlign: "center" }}>Loading...</p>;

  const { formattedDate, formattedTime } = getCurrentDateTime();

  return (
    <div style={{ textAlign: "center", padding: "2rem", maxWidth: 500, margin: "0 auto" }}>
      <h2>🎉 Congratulations!</h2>
      <p>You have completed the quest with these stats:</p>

      <div style={{ margin: "1.5rem 0", lineHeight: "1.8" }}>
        <div><strong>Total Time:</strong> {formatTime(player.totalTimeInSeconds)}</div>
        <div><strong>Questions Correct:</strong> Coming soon</div>
        <div><strong>Penalties:</strong> Coming soon</div>
        <div><strong>Final Score:</strong> {player.score}</div>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: "2rem" }}>
        <button 
          onClick={() => {
            if (navigator.share) {
                navigator.share({
                title: 'GoChangi Challenge Completed!',
                text: `I just finished the GoChangi quest with a score of ${player.score}! Try it yourself!`,
                url: window.location.origin,
                })
                .then(() => console.log('Shared successfully'))
                .catch((err) => console.error('Share failed:', err));
            } else {
                alert('Sharing is not supported on this device/browser.');
            }
            }}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none"
          }}
        >
          Share
        </button>

        <button
          onClick={() => navigate("/leaderboard")}
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none"
          }}
        >
          Leaderboard
        </button>
      </div>

      <p style={{ fontWeight: "bold", marginTop: "2rem" }}>
        🎁 Redeem your gifts at the redemption booth now!
      </p>
      <p>{formattedDate}, {formattedTime}</p>

      <div style={{ marginTop: "1rem", fontSize: "18px" }}>
        <strong>Your Reward Code:</strong><br />
        <span style={{ fontSize: "24px", letterSpacing: "2px" }}>{player.rewardCode}</span>
      </div>
    </div>
  );
}