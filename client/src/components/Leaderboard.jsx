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
  if (filter === "day") return d.toDateString() === now.toDateString();
  if (filter === "week") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start && d <= now;
  }
  if (filter === "month") return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  return true;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([]);
  const [collections, setCollections] = useState({});
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);

  const pageSize = 10;
  const currentPlayerId = sessionStorage.getItem("playerId");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [playersRes, collectionsRes] = await Promise.all([
          fetch("http://172.20.10.2:5000/players"),
          fetch("http://172.20.10.2:5000/collections"),
        ]);
        const [playersData, collectionsData] = await Promise.all([
          playersRes.json(),
          collectionsRes.json(),
        ]);

        const finishedPlayers = playersData.filter(p => p.finishedAt);
        const sorted = finishedPlayers.sort((a, b) =>
          b.score === a.score ? a.totalTimeInSeconds - b.totalTimeInSeconds : b.score - a.score
        );
        setPlayers(sorted);

        const colMap = {};
        collectionsData.forEach(col => colMap[col._id] = col.name);
        setCollections(colMap);

        const currentIndex = sorted.findIndex(p => p._id === currentPlayerId);
        setPage(Math.max(0, Math.floor(currentIndex / pageSize)));
      } catch (err) {
        console.error(err);
      }
    }
    fetchAll();
  }, []);

  useEffect(() => setPage(0), [filter]);

  const filteredPlayers = players.filter(p => isWithin(p.finishedAt, filter));
  const totalPages = Math.ceil(filteredPlayers.length / pageSize);
  const pagedPlayers = filteredPlayers.slice(page * pageSize, (page + 1) * pageSize);

  const formatTime = (s) => {
    const m = Math.floor(s / 60), sec = s % 60;
    const h = Math.floor(m / 60);
    return `${h > 0 ? `${h}h ` : ""}${m % 60}m ${sec}s`;
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("en-SG", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

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
                {pagedPlayers.map((player) => {
                  const rank = filteredPlayers.findIndex(p => p._id === player._id);
                  const isCurrent = player._id === currentPlayerId;
                  const correct = player.score / 500;
                  const highlight =
                    rank === 0 ? "gold" :
                    rank === 1 ? "silver" :
                    rank === 2 ? "bronze" : "";

                  return (
                    <tr
                      key={player._id}
                      className={`${highlight} ${isCurrent ? "current-player" : ""}`}
                      onMouseEnter={() => setHoveredPlayerId(player._id)}
                      onMouseLeave={() => setHoveredPlayerId(null)}
                    >
                      <td>{rank + 1}</td>
                      <td style={{ position: "relative" }}>
                        {player.username}
                        {isCurrent && <span className="you-indicator"> ← You</span>}

                        {hoveredPlayerId === player._id && (
                          <div className="player-tooltip">
                            <div><strong>Collection:</strong> {collections[player.collectionId] || "Unknown"}</div>
                            <div><strong>Date:</strong> {formatDate(player.finishedAt)}</div>
                            <div><strong>Correct:</strong> {correct} / 12</div>
                          </div>
                        )}
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
  