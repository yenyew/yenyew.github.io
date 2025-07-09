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

export default function LeaderboardAdmin() {
  const baseUrl = "http://172.20.10.2:5000";

  const [players, setPlayers] = useState([]);
  const [collections, setCollections] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [page, setPage] = useState(0);
  

  // Auto-clear config
  const [autoClear, setAutoClear] = useState({ interval: "day", target: "today", collectionId: "all" });
  // For staging changes in the modal
  const [tempAuto, setTempAuto] = useState(autoClear);

  // Modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualRange, setManualRange] = useState("day");
  const [manualCol, setManualCol] = useState("all");

  const [showAutoModal, setShowAutoModal] = useState(false);

  const pageSize = 10;

  useEffect(() => {
    async function fetchData() {
      const [plRes, colRes, acRes] = await Promise.all([
        fetch(`${baseUrl}/players`),
        fetch(`${baseUrl}/collections`),
        fetch(`${baseUrl}/auto-clear-config`)
      ]);
      const [plData, colData, acData] = await Promise.all([
        plRes.json(), colRes.json(), acRes.json()
      ]);

      // players
      const done = plData.filter(p => p.finishedAt);
      done.sort((a, b) => a.totalTimeInSeconds - b.totalTimeInSeconds);
      setPlayers(done);

      // collections map
      const cmap = {};
      colData.forEach(c => cmap[c._id] = c.name);
      setCollections(cmap);

      // auto-clear
      if (acData) {
        const cfg = {
          interval: acData.interval,
          target: acData.target,
          collectionId: acData.collectionId || "all"
        };
        setAutoClear(cfg);
        setTempAuto(cfg);
      }
    }
    fetchData();
  }, []);

  // filtered + paged
  const filtered = players.filter(p =>
    isWithin(p.finishedAt, filter) &&
    (selectedCollection === "all" || p.collectionId === selectedCollection)
  );
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const formatTime = s => {
    const m = Math.floor(s / 60), sec = s % 60;
    const h = Math.floor(m / 60);
    return `${h>0?`${h}h `:""}${m%60}m ${sec}s`;
  };
  const formatDate = dt => new Date(dt).toLocaleString("en-SG", {
    year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
  });

  // --- Manual Clear Handlers ---
  const openManual = () => {
    setManualRange("day");
    setManualCol("all");
    setShowManualModal(true);
  };
  const closeManual = () => setShowManualModal(false);

  const confirmManualClear = async () => {
    try {
      // If both "all", call full-clear
      if (manualRange === "all" && manualCol === "all") {
        await fetch(`${baseUrl}/players/clear`, { method: "DELETE" });
        alert("All players cleared");
      } else {
        // call manual-clear with JSON body for optional collection filter
        const res = await fetch(`${baseUrl}/players/manual-clear/${manualRange}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualCol === "all" ? {} : { collectionId: manualCol })
      });
        const data = await res.json();
        alert(`Deleted ${data.deletedCount ?? "?"} players`);
      }
      window.location.reload();
    } catch (e) {
      alert("Failed to clear leaderboard");
    }
  };

  // --- Auto-Clear Handlers ---
  const openAuto = () => {
    setTempAuto(autoClear);
    setShowAutoModal(true);
  };
  const closeAuto = () => setShowAutoModal(false);

  const confirmAuto = async () => {
    try {
      const res = await fetch(`${baseUrl}/auto-clear-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tempAuto)
      });
      await res.json();
      setAutoClear(tempAuto);
      alert("Auto-clear config saved");
      setShowAutoModal(false);
    } catch {
      alert("Failed to save auto-clear config");
    }
  };

  return (
    <div className="page-container">
      <img src="/images/waterfall.jpg" className="page-background" alt="" />
      <div className="page-overlay"></div>
      <div className="page-content leaderboard-page">
        <h1 className="leaderboard-title">Admin Leaderboard</h1>

        {/** Filters **/}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <select className="filter-select" value={filter} onChange={e=>setFilter(e.target.value)}>
            {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select className="filter-select" value={selectedCollection} onChange={e=>setSelectedCollection(e.target.value)}>
            <option value="all">All Collections</option>
            {Object.entries(collections).map(([id,name])=>(
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {paged.length === 0
          ? <p className="no-results">No completed players.</p>
          : <>
              <table className="leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th><th>Name</th><th>Time</th><th>Collection</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p,i)=>(
                    <tr key={p._id}>
                      <td>{i+1+page*pageSize}</td>
                      <td>{p.username}</td>
                      <td>{formatTime(p.totalTimeInSeconds)}</td>
                      <td>{collections[p.collectionId]||"Unknown"}</td>
                      <td>{formatDate(p.finishedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button onClick={()=>setPage(x=>Math.max(0,x-1))} disabled={page===0}>← Prev</button>
                <span>Page {page+1} of {totalPages}</span>
                <button onClick={()=>setPage(x=>Math.min(totalPages-1,x+1))} disabled={page>=totalPages-1}>Next →</button>
              </div>
            </>
        }

        {/** Action Buttons **/}
        <div style={{ marginTop:20, display:"flex", gap:10 }}>
          <button onClick={openManual}>Manual Clear…</button>
          <button onClick={openAuto}>Auto-Clear Settings…</button>
          <button className="return-button" onClick={()=>window.history.back()}>Return</button>
        </div>
      </div>

      {/** Manual Clear Modal **/}
      {showManualModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Manual Clear</h3>
            <div style={{ marginBottom:10, textAlign:"left" }}>
              <label>Range:</label>
              <select value={manualRange} onChange={e=>setManualRange(e.target.value)}>
                {FILTERS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div style={{ marginBottom:20, textAlign:"left" }}>
              <label>Collection:</label>
              <select value={manualCol} onChange={e=>setManualCol(e.target.value)}>
                <option value="all">All Collections</option>
                {Object.entries(collections).map(([id,name])=>(
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <button onClick={confirmManualClear} style={{ marginRight:10 }}>Confirm</button>
            <button onClick={closeManual}>Cancel</button>
          </div>
        </div>
      )}

      {/** Auto-Clear Modal **/}
      {showAutoModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Auto-Clear Configuration</h3>
            <div style={{ marginBottom:10, textAlign:"left" }}>
              <label>Interval:</label>
              <select
                value={tempAuto.interval}
                onChange={e=>setTempAuto(t=>({...t, interval:e.target.value}))}
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
            <div style={{ marginBottom:10, textAlign:"left" }}>
              <label>Target Range:</label>
              <select
                value={tempAuto.target}
                onChange={e=>setTempAuto(t=>({...t, target:e.target.value}))}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="all">All Players</option>
              </select>
            </div>
            <div style={{ marginBottom:20, textAlign:"left" }}>
              <label>Collection:</label>
              <select
                value={tempAuto.collectionId}
                onChange={e=>setTempAuto(t=>({...t, collectionId:e.target.value}))}
              >
                <option value="all">All Collections</option>
                {Object.entries(collections).map(([id,name])=>(
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
            <button onClick={confirmAuto} style={{ marginRight:10 }}>Save</button>
            <button onClick={closeAuto}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
