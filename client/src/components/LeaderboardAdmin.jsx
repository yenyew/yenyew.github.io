/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './MainStyles.css';
import './LeaderboardStyles.css';
import AlertModal from "./AlertModal";
import { ManualClearModal, AutoClearModal, AutoClearLogModal } from "./LeaderboardClearModals";

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
  const baseUrl = "http://localhost:5000";
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [collections, setCollections] = useState({});
  const [filter, setFilter] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [page, setPage] = useState(0);
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoClearConfigs, setAutoClearConfigs] = useState({});
  const [tempAuto, setTempAuto] = useState({
    interval: "day",
    target: "today",
    startDate: null,
    endDate: null,
    customIntervalValue: null,
    customIntervalUnit: "minute",
  });
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualRange, setManualRange] = useState("day");
  const [manualCol, setManualCol] = useState("all");
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logCollection, setLogCollection] = useState("all");
  const [selectedConfigCollection, setSelectedConfigCollection] = useState(null);

  // AlertModal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [pendingManualClear, setPendingManualClear] = useState(false);
  const [pendingClearCount, setPendingClearCount] = useState(0);
  const [pendingDeleteConfig, setPendingDeleteConfig] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [playersRes, collectionsRes] = await Promise.all([
          fetch(`${baseUrl}/players`),
          fetch(`${baseUrl}/collections`),
        ]);
        const [playersData, collectionsData] = await Promise.all([
          playersRes.json(),
          collectionsRes.json(),
        ]);

        const finishedPlayers = playersData
          .filter(p => p.finishedAt)
          .sort((a, b) => a.totalTimeInSeconds - b.totalTimeInSeconds);
        setPlayers(finishedPlayers);

        const collectionsMap = {};
        collectionsData.forEach(c => (collectionsMap[c._id] = c.name));
        setCollections(collectionsMap);

        const configs = await Promise.all(
          collectionsData.map(async (col) => {
            const res = await fetch(`${baseUrl}/auto-clear-config/${col._id}`);
            return res.status === 200 ? { [col._id]: await res.json() } : { [col._id]: null };
          })
        );
        const configsMap = Object.assign({}, ...configs);
        setAutoClearConfigs(configsMap);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setModalTitle("Error");
        setModalMessage("Failed to load leaderboard data.");
        setShowErrorModal(true);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => setPage(0), [filter, selectedCollection]);

  useEffect(() => {
    if (showLogModal && selectedCollection !== "all") {
      async function fetchLogs() {
        try {
          const res = await fetch(`${baseUrl}/auto-clear-config/${selectedCollection}/logs`);
          const data = await res.json();
          setLogs(data);
        } catch (err) {
          console.error("Error fetching logs:", err);
          setModalTitle("Error");
          setModalMessage("Failed to fetch auto-clear logs.");
          setShowErrorModal(true);
        }
      }
      fetchLogs();
    }
  }, [showLogModal, selectedCollection]);

  const filteredPlayers = players.filter(p =>
    isWithin(p.finishedAt, filter) &&
    (selectedCollection === "all" || p.collectionId === selectedCollection)
  );
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

  // Manual Clear
  const openManual = () => {
    setManualRange("day");
    setManualCol("all");
    setShowManualModal(true);
  };

  const closeManual = () => setShowManualModal(false);

  const confirmManualClear = async () => {
    setShowManualModal(false);
    const count = filteredPlayers.filter(p =>
      isWithin(p.finishedAt, manualRange) &&
      (manualCol === "all" || p.collectionId === manualCol)
    ).length;

    setPendingClearCount(count);
    setModalTitle("Confirm Manual Clear");
    setModalMessage(
      `You are about to remove ${count} player(s) from ${manualRange === "all" ? "All Time" : FILTERS.find(f => f.value === manualRange)?.label} in ${manualCol === "all" ? "All Collections" : collections[manualCol]}. Proceed?`
    );
    setPendingManualClear(true);
    setShowConfirmModal(true);
  };

  const doManualClear = async () => {
    try {
      if (manualRange === "all" && manualCol === "all") {
        await fetch(`${baseUrl}/players/clear`, { method: "DELETE" });
      } else {
        await fetch(`${baseUrl}/players/manual-clear/${manualRange}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(manualCol === "all" ? {} : { collectionId: manualCol }),
        });
      }
      setModalTitle("Success");
      setModalMessage("Players cleared successfully.");
      setShowSuccessModal(true);
      setPage(0);
      setTimeout(() => window.location.reload(), 1200);
    } catch (e) {
      setModalTitle("Error");
      setModalMessage("Failed to clear leaderboard.");
      setShowErrorModal(true);
    }
    setShowConfirmModal(false);
    setPendingManualClear(false);
  };

  // Auto-Clear
  const openAuto = () => {
    if (selectedCollection === "all") {
      setModalTitle("Error");
      setModalMessage("Please select a specific collection to configure auto-clear.");
      setShowErrorModal(true);
      return;
    }
    setSelectedConfigCollection(selectedCollection);
    const config = autoClearConfigs[selectedCollection] || {
      interval: "day",
      target: "today",
      startDate: null,
      endDate: null,
      customIntervalValue: null,
      customIntervalUnit: "minute",
    };
    setTempAuto(config);
    setShowAutoModal(true);
  };

  const closeAuto = () => {
    setShowAutoModal(false);
    setSelectedConfigCollection(null);
  };

  const confirmAuto = async () => {
    const payload = {
      interval: tempAuto.interval,
      target: tempAuto.target,
      clearTime: tempAuto.clearTime, 
      ...(tempAuto.target === "custom" && {
        startDate: tempAuto.startDate,
        endDate: tempAuto.endDate,
      }),
      ...(tempAuto.interval === "custom" && {
        customIntervalValue: Number(tempAuto.customIntervalValue),
        customIntervalUnit: tempAuto.customIntervalUnit,
      }),
    };

    try {
      const response = await fetch(`${baseUrl}/auto-clear-config/${selectedConfigCollection}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const updatedConfig = await response.json();
      setAutoClearConfigs({
        ...autoClearConfigs,
        [selectedConfigCollection]: updatedConfig.config,
      });
      setModalTitle("Success");
      setModalMessage(`Auto-clear configuration saved for ${collections[selectedConfigCollection]}.`);
      setShowSuccessModal(true);
      setShowAutoModal(false);
    } catch (e) {
      setModalTitle("Error");
      setModalMessage("Failed to save auto-clear configuration.");
      setShowErrorModal(true);
    }
  };

  const deleteAuto = async () => {
    setShowAutoModal(false);
    setModalTitle("Confirm Delete");
    setModalMessage(`Are you sure you want to delete the auto-clear configuration for ${collections[selectedConfigCollection]}? This will stop all auto-clearing for this collection.`);
    setPendingDeleteConfig(true);
    setShowConfirmModal(true);
  };

  const confirmDeleteAuto = async () => {
    try {
      const response = await fetch(`${baseUrl}/auto-clear-config/${selectedConfigCollection}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        setAutoClearConfigs({
          ...autoClearConfigs,
          [selectedConfigCollection]: null,
        });
        setModalTitle("Success");
        setModalMessage(`Auto-clear configuration deleted for ${collections[selectedConfigCollection]}.`);
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to delete config");
      }
    } catch (e) {
      setModalTitle("Error");
      setModalMessage("Failed to delete auto-clear configuration.");
      setShowErrorModal(true);
    }
    setShowConfirmModal(false);
    setPendingDeleteConfig(false);
  };

  // View Logs
  const openLogs = () => {
    if (selectedCollection === "all") {
      setModalTitle("Error");
      setModalMessage("Please select a specific collection to view auto-clear logs.");
      setShowErrorModal(true);
      return;
    }
    setLogCollection(selectedCollection);
    setShowLogModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setShowConfirmModal(false);
    setPendingManualClear(false);
    setPendingDeleteConfig(false);
  };

  if (loading) {
    return (
      <div className="page-container">
        <img src="/images/waterfall.jpg" alt="Background" className="page-background" />
        <div className="page-overlay"></div>
        <div className="page-content" style={{ textAlign: "center" }}>
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <img src="/images/waterfall.jpg" alt="Background" className="page-background" />
      <div className="page-overlay"></div>
      <div className="page-content leaderboard-page">
        <h1 className="leaderboard-title">Admin Leaderboard</h1>

        <div style={{ display: "flex", gap: 10, marginBottom: 20, justifyContent: "center" }}>
          <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
            {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <select className="filter-select" value={selectedCollection} onChange={e => setSelectedCollection(e.target.value)}>
            <option value="all">All Collections</option>
            {Object.entries(collections).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        {selectedCollection !== "all" && autoClearConfigs[selectedCollection] && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ fontSize: "0.9em", color: "#666" }}>
              <strong>Auto-Clear Config:</strong> Clear {autoClearConfigs[selectedCollection].interval === "custom" ? `every ${autoClearConfigs[selectedCollection].customIntervalValue} ${autoClearConfigs[selectedCollection].customIntervalUnit}` : `every ${autoClearConfigs[selectedCollection].interval}`} 
              {autoClearConfigs[selectedCollection].target === "custom" ? `, data from ${new Date(autoClearConfigs[selectedCollection].startDate).toLocaleDateString()} to ${new Date(autoClearConfigs[selectedCollection].endDate).toLocaleDateString()}` : `, ${autoClearConfigs[selectedCollection].target} data`}
            </p>
          </div>
        )}

        {pagedPlayers.length === 0 ? (
          <div style={{ textAlign: "center", margin: "40px 0" }}>
            <p className="no-results">
              No completed players in {selectedCollection === "all" ? "All Collections" : collections[selectedCollection]}.
            </p>
            {filter !== "all" && (
              <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                Try changing the time filter to see more results.
              </p>
            )}
          </div>
        ) : (
          <>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Time</th>
                  <th>Collection</th>
                  <th>Date</th>
                  <th>Redeemed</th>
                </tr>
              </thead>
              <tbody>
                {pagedPlayers.map((player) => {
                  const rank = filteredPlayers.findIndex(p => p._id === player._id) + 1;
                  return (
                    <tr
                      key={player._id}
                      style={{ backgroundColor: "rgba(255, 255, 255, 0.35)" }}
                      onMouseEnter={() => setHoveredPlayerId(player._id)}
                      onMouseLeave={() => setHoveredPlayerId(null)}
                    >
                      <td>{rank}</td>
                      <td style={{ position: "relative" }}>
                        {player.username}
                        {hoveredPlayerId === player._id && (
                          <div className="player-tooltip">
                            <div><strong>Collection:</strong> {collections[player.collectionId] || "Unknown"}</div>
                            <div><strong>Finished:</strong> {formatDate(player.finishedAt)}</div>
                            {player.redeemed && <div><strong>Redeemed:</strong> {formatDate(player.redeemedAt)}</div>}
                          </div>
                        )}
                      </td>
                      <td>{formatTime(player.totalTimeInSeconds)}</td>
                      <td>{collections[player.collectionId] || "Unknown"}</td>
                      <td>{formatDate(player.finishedAt)}</td>
                      <td>{player.redeemed ? "✓" : "✗"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
                margin: "20px 0",
                maxWidth: "300px",
                marginLeft: "auto",
                marginRight: "auto"
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{ minWidth: "80px" }}
                >
                  ← Prev
                </button>
                <span style={{ textAlign: "center", minWidth: "100px" }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{ minWidth: "80px" }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        <div style={{
          marginTop: 30,
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={openManual}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "none",
              background: "#ff6b6b",
              color: "white",
              cursor: "pointer",
              minWidth: "120px"
            }}
          >
            Manual Clear
          </button>
          <button
            onClick={openAuto}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "none",
              background: "#4ecdc4",
              color: "white",
              cursor: "pointer",
              minWidth: "120px"
            }}
          >
            Auto-Clear
          </button>
          <button
            onClick={openLogs}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              borderRadius: "8px",
              border: "none",
              background: "#2196F3",
              color: "white",
              cursor: "pointer",
              minWidth: "120px"
            }}
          >
            View Auto-Clear Logs
          </button>
          <button className="return-button" style={{ minWidth: "120px" }} onClick={() => navigate("/admin")}>
            Return
          </button>
        </div>
      </div>

      <ManualClearModal
        isOpen={showManualModal}
        manualRange={manualRange}
        setManualRange={setManualRange}
        manualCol={manualCol}
        setManualCol={setManualCol}
        collections={collections}
        onConfirm={confirmManualClear}
        onClose={closeManual}
      />
      <AutoClearModal
        isOpen={showAutoModal}
        autoClear={autoClearConfigs[selectedConfigCollection]}
        tempAuto={tempAuto}
        setTempAuto={setTempAuto}
        onConfirm={confirmAuto}
        onClose={closeAuto}
        onDelete={deleteAuto}
        collectionName={collections[selectedConfigCollection] || "Selected Collection"}
      />
      <AutoClearLogModal
        isOpen={showLogModal}
        collections={collections}
        logs={logs}
        setLogCollection={setLogCollection}
        logCollection={logCollection}
        onClose={() => setShowLogModal(false)}
      />
      <AlertModal
        isOpen={showConfirmModal && (pendingManualClear || pendingDeleteConfig)}
        onClose={handleModalClose}
        onConfirm={pendingManualClear ? doManualClear : confirmDeleteAuto}
        title={modalTitle}
        message={modalMessage}
        confirmText={pendingManualClear ? "Clear" : "Delete"}
        cancelText="Cancel"
        type="warning"
        showCancel={true}
      />
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />
      <AlertModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="info"
        showCancel={false}
      />
    </div>
  );
}