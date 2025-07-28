import React, { useState } from "react";

const FILTERS = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

export function ManualClearModal({ isOpen, manualRange, setManualRange, manualCol, setManualCol, collections, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ color: "black" }}>
        <h3 style={{ color: "black" }}>Manual Clear</h3>
        <div style={{ marginBottom: 10, textAlign: "left", color: "black" }}>
          <label style={{ color: "black" }}>Range:</label>
          <select value={manualRange} onChange={(e) => setManualRange(e.target.value)}>
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 20, textAlign: "left", color: "black" }}>
          <label style={{ color: "black" }}>Collection:</label>
          <select value={manualCol} onChange={(e) => setManualCol(e.target.value)}>
            <option value="all">All Collections</option>
            {Object.entries(collections).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        <button onClick={onConfirm} style={{ marginRight: 10, color: "black" }}>
          Confirm
        </button>
        <button onClick={onClose} style={{ color: "black" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AutoClearModal({ isOpen, autoClear, tempAuto, setTempAuto, onConfirm, onClose, collectionName }) {
  if (!isOpen) return null;

  const isCustomIntervalInvalid =
    tempAuto.interval === "custom" && (!tempAuto.customIntervalValue || !tempAuto.customIntervalUnit);

  const isSaveDisabled =
    (tempAuto.target === "custom" && (!tempAuto.startDate || !tempAuto.endDate)) ||
    isCustomIntervalInvalid;

  const availableIntervals = [
    { label: "Daily", value: "day" },
    { label: "Weekly", value: "week" },
    { label: "Monthly", value: "month" },
    { label: "Custom Interval", value: "custom" },
  ].filter((interval) => {
    if (tempAuto.target === "today") return true;
    if (tempAuto.target === "week") return ["week", "month", "custom"].includes(interval.value);
    if (tempAuto.target === "month") return ["month", "custom"].includes(interval.value);
    if (tempAuto.target === "all" || tempAuto.target === "custom") return true;
    return false;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ color: "black" }}>
        <h3 style={{ color: "black" }}>Auto-Clear Configuration for {collectionName}</h3>
        {autoClear && (
          <p style={{ fontSize: "0.9em", color: "black", marginBottom: "10px" }}>
            <strong style={{ color: "black" }}>Current:</strong> Interval: {autoClear.interval}, 
            Target: {autoClear.target}
            {autoClear.interval === "custom" && (
              <span>, Custom: {autoClear.customIntervalValue} {autoClear.customIntervalUnit}</span>
            )}
            {autoClear.target === "custom" && (
              <span>, Range: {new Date(autoClear.startDate).toLocaleDateString()} - {new Date(autoClear.endDate).toLocaleDateString()}</span>
            )}
          </p>
        )}

        <div style={{ marginBottom: 10, textAlign: "left", color: "black" }}>
          <label style={{ color: "black" }}>Interval:</label>
          <select
            value={tempAuto.interval}
            onChange={(e) => setTempAuto((t) => ({ ...t, interval: e.target.value }))}
          >
            {availableIntervals.map((interval) => (
              <option key={interval.value} value={interval.value}>
                {interval.label}
              </option>
            ))}
          </select>
        </div>

        {tempAuto.interval === "custom" && (
          <div style={{ marginTop: 10, textAlign: "left", color: "black" }}>
            <label style={{ color: "black" }}>Custom Interval:</label>
            <input
              type="number"
              min="1"
              value={tempAuto.customIntervalValue || ""}
              onChange={(e) => setTempAuto((t) => ({ ...t, customIntervalValue: e.target.value }))}
              placeholder="Enter number"
              style={{ color: "black" }}
            />
            <select
              value={tempAuto.customIntervalUnit || "minute"}
              onChange={(e) => setTempAuto((t) => ({ ...t, customIntervalUnit: e.target.value }))}
            >
              <option value="minute">Minutes</option>
              <option value="hour">Hours</option>
              <option value="day">Days</option>
            </select>
          </div>
        )}

        <div style={{ marginBottom: 10, textAlign: "left", color: "black" }}>
          <label style={{ color: "black" }}>Target Range:</label>
          <select
            value={tempAuto.target}
            onChange={(e) => setTempAuto((t) => ({ ...t, target: e.target.value }))}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
            <option value="all">All Players</option>
          </select>
        </div>

        {tempAuto.target === "custom" && (
          <div style={{ marginBottom: 10, textAlign: "left", color: "black" }}>
            <label style={{ color: "black" }}>Start Date:</label>
            <input
              type="date"
              value={tempAuto.startDate?.slice(0, 10) || ""}
              onChange={(e) => setTempAuto((t) => ({ ...t, startDate: e.target.value }))}
              style={{ color: "black" }}
            />
            <br />
            <label style={{ color: "black" }}>End Date:</label>
            <input
              type="date"
              value={tempAuto.endDate?.slice(0, 10) || ""}
              onChange={(e) => setTempAuto((t) => ({ ...t, endDate: e.target.value }))}
              style={{ color: "black" }}
            />
          </div>
        )}

        <button
          onClick={onConfirm}
          style={{ marginRight: 10, color: "black" }}
          disabled={isSaveDisabled}
        >
          Save
        </button>
        <button onClick={onClose} style={{ color: "black" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function AutoClearLogModal({ isOpen, collections, logs, setLogCollection, logCollection, onClose }) {
  const [page, setPage] = useState(0);
  const pageSize = 3;

  if (!isOpen) return null;

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString("en-SG", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const filteredLogs = logs.filter(log => logCollection === "all" || log.collectionId === logCollection);
  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const pagedLogs = filteredLogs.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ 
        color: "black", 
        maxWidth: "500px", // Reduced width
        width: "90%", // Responsive width for smaller screens
        maxHeight: "80vh", // Limit height to 80% of viewport
        overflowY: "auto" // Scroll if content exceeds height
      }}>
        <h3 style={{ color: "black", marginBottom: "10px" }}>Auto-Clear Logs</h3>
        <div style={{ marginBottom: "10px", textAlign: "left", color: "black" }}>
          <label style={{ color: "black" }}>Collection:</label>
          <select
            value={logCollection}
            onChange={(e) => {
              setLogCollection(e.target.value);
              setPage(0); // Reset to first page when collection changes
            }}
            style={{ width: "100%", padding: "5px" }}
          >
            <option value="all">All Collections</option>
            {Object.entries(collections).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>
        {filteredLogs.length === 0 ? (
          <p style={{ color: "black", textAlign: "center" }}>
            No logs available for {logCollection === "all" ? "All Collections" : collections[logCollection]}.
          </p>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}> {/* Horizontal scroll for table if needed */}
              <table style={{ 
                width: "100%", 
                borderCollapse: "collapse", 
                color: "black",
                fontSize: "14px" // Smaller font for compactness
              }}>
                <thead>
                  <tr>
                    <th style={{ border: "1px solid #ddd", padding: "6px", textAlign: "left" }}>Date</th>
                    <th style={{ border: "1px solid #ddd", padding: "6px", textAlign: "left" }}>Collection</th>
                    <th style={{ border: "1px solid #ddd", padding: "6px", textAlign: "left" }}>Interval</th>
                    <th style={{ border: "1px solid #ddd", padding: "6px", textAlign: "left" }}>Target</th>
                    <th style={{ border: "1px solid #ddd", padding: "6px", textAlign: "left" }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLogs.map(log => (
                    <tr key={log._id}>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>{formatDate(log.clearedAt)}</td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>{collections[log.collectionId] || "Unknown"}</td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        {log.interval === "custom" ? `${log.interval} (${log.customIntervalValue} ${log.customIntervalUnit})` : log.interval}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                        {log.target === "custom" ? `${log.target} (${formatDate(log.range.start)} - ${formatDate(log.range.end)})` : log.target}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "6px" }}>{log.clearedCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                gap: "10px"
              }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "none",
                    background: page === 0 ? "#ccc" : "#2196F3",
                    color: "white",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    minWidth: "60px"
                  }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: "12px", color: "black" }}>
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  style={{
                    padding: "5px 10px",
                    fontSize: "12px",
                    borderRadius: "4px",
                    border: "none",
                    background: page >= totalPages - 1 ? "#ccc" : "#2196F3",
                    color: "white",
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                    minWidth: "60px"
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
        <button 
          onClick={onClose} 
          style={{ 
            marginTop: "15px", 
            color: "black", 
            padding: "8px 16px", 
            borderRadius: "4px",
            border: "1px solid #ddd",
            background: "transparent",
            cursor: "pointer",
            width: "100%"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}