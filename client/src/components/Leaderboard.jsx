import React, { useEffect, useState } from "react";

const FILTERS = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

function isWithin(date, filter) {
  const now = new Date();
  const d = new Date(date);
  if (filter === "day") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  }
  if (filter === "week") {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return d >= startOfWeek && d <= now;
  }
  if (filter === "month") {
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }
  return true; // all time
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://localhost:5000/players");
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setPlayers(data.filter(p => p.finishedAt));
      } catch (err) {
        console.error(err);
      }
    }
    fetchPlayers();
  }, []);

  // Filter and sort
  const filteredPlayers = players
    .filter(p => isWithin(p.finishedAt, filter))
    .sort((a, b) => {
      if (b.score === a.score) {
        return a.totalTimeInSeconds - b.totalTimeInSeconds;
      }
      return b.score - a.score;
    });

  // Pagination
  const totalPages = Math.ceil(filteredPlayers.length / pageSize);
  const pagedPlayers = filteredPlayers.slice(page * pageSize, (page + 1) * pageSize);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  const handleBack = () => {
    window.history.back();
  };

  // Highlight current player
  const currentPlayerId = sessionStorage.getItem("playerId");

  // Reset to first page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filter]);

  return (
    <div style={{ maxWidth: 500, margin: "32px auto", textAlign: "center" }}>
      <button
        onClick={handleBack}
        style={{
          marginBottom: "16px",
          padding: "8px 24px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>
      <h2>🏆 Leaderboard</h2>
      <div style={{ marginBottom: "16px" }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: "8px", fontSize: "16px", borderRadius: "8px" }}
        >
          {FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>
      {pagedPlayers.length === 0 ? (
        <p>No completed players yet.</p>
      ) : (
        <>
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
              {pagedPlayers.map((player, index) => (
                <tr
                  key={player._id}
                  style={
                    player._id === currentPlayerId
                      ? { backgroundColor: "#ffe066", fontWeight: "bold" }
                      : {}
                  }
                >
                  <td style={{ padding: "8px" }}>{page * pageSize + index + 1}</td>
                  <td style={{ padding: "8px" }}>{player.username}</td>
                  <td style={{ padding: "8px" }}>{player.score}</td>
                  <td style={{ padding: "8px" }}>{formatTime(player.totalTimeInSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: "16px", display: "flex", justifyContent: "center", gap: 16 }}>
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              &larr; Prev
            </button>
            <span>
              Page {page + 1} of {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              Next &rarr;
            </button>
          </div>
        </>
      )}
    </div>
  );
}