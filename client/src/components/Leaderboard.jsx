import React, { useEffect, useState } from "react";
import './MainStyles.css';

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
  return true;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const currentPlayerId = sessionStorage.getItem("playerId");

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://172.20.10.2:5000/players");
        const data = await response.json();
        const filtered = data.filter(p => p.finishedAt);

        const sorted = filtered.sort((a, b) =>
          b.score === a.score
            ? a.totalTimeInSeconds - b.totalTimeInSeconds
            : b.score - a.score
        );

        const currentIndex = sorted.findIndex(p => p._id === currentPlayerId);
        const initialPage = Math.floor(currentIndex / pageSize);

        setPlayers(sorted);
        setPage(initialPage >= 0 ? initialPage : 0);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPlayers();
  }, []);

  useEffect(() => setPage(0), [filter]);

  const filteredPlayers = players.filter(p => isWithin(p.finishedAt, filter));
  const totalPages = Math.ceil(filteredPlayers.length / pageSize);
  const pagedPlayers = filteredPlayers.slice(page * pageSize, (page + 1) * pageSize);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  return (
    <div className="page-container">
      <img src="/images/waterfall.jpg" alt="Background" className="page-background" />
      <div className="page-overlay"></div>

      <div className="page-content leaderboard-page">
        <h1 className="leaderboard-title">Leaderboard</h1>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          {FILTERS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {pagedPlayers.length === 0 ? (
          <p className="no-results">No completed players yet.</p>
        ) : (
          <>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {pagedPlayers.map((player, index) => {
                  const overallRank = players.findIndex(p => p._id === player._id);
                  const isCurrent = player._id === currentPlayerId;

                  const highlightClass =
                    overallRank === 0 ? "gold" :
                    overallRank === 1 ? "silver" :
                    overallRank === 2 ? "bronze" : "";

                  return (
                    <tr
                      key={player._id}
                      className={`${highlightClass} ${isCurrent ? "current-player" : ""}`}
                    >
                      <td>{overallRank + 1}</td>
                      <td>
                        {player.username}
                        {isCurrent && <span className="you-indicator"> ← You</span>}
                      </td>
                      <td>{player.score}</td>
                      <td>{formatTime(player.totalTimeInSeconds)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                ← Prev
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
                Next →
              </button>
            </div>
          </>
        )}

        <button className="return-button" onClick={() => window.history.back()}>
          Return
        </button>
      </div>
    </div>
  );
}
