import React, { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://localhost:5000/players");
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();

        // Sort players by score descending, then by totalTimeInSeconds ascending
        const sorted = data
          .filter(p => p.finishedAt) // Only show those who completed
          .sort((a, b) => {
            if (b.score === a.score) {
              return a.totalTimeInSeconds - b.totalTimeInSeconds;
            }
            return b.score - a.score;
          });

        setPlayers(sorted.slice(0, 3)); // Top 3 only
      } catch (err) {
        console.error(err);
      }
    }

    fetchPlayers();
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  return (
    <div style={{ maxWidth: 500, margin: "32px auto", textAlign: "center" }}>
      <h2>🏆 Leaderboard</h2>
      {players.length === 0 ? (
        <p>No completed players yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Rank</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Name</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Score</th>
              <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player._id}>
                <td style={{ padding: "8px" }}>{index + 1}</td>
                <td style={{ padding: "8px" }}>{player.username}</td>
                <td style={{ padding: "8px" }}>{player.score}</td>
                <td style={{ padding: "8px" }}>{formatTime(player.totalTimeInSeconds)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
