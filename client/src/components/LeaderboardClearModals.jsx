import React from "react";

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

export function AutoClearModal({ isOpen, autoClear, tempAuto, setTempAuto, onConfirm, onClose }) {
  if (!isOpen) return null;

  const isCustomIntervalInvalid =
    tempAuto.interval === "custom" && (!tempAuto.customIntervalValue || !tempAuto.customIntervalUnit);

  const isSaveDisabled =
    (tempAuto.target === "custom" && (!tempAuto.startDate || !tempAuto.endDate)) ||
    isCustomIntervalInvalid;

  // Define available intervals based on target
  const availableIntervals = [
    { label: "Daily", value: "day" },
    { label: "Weekly", value: "week" },
    { label: "Monthly", value: "month" },
    { label: "Custom Interval", value: "custom" },
  ].filter((interval) => {
    if (tempAuto.target === "today") return true; // All intervals allowed
    if (tempAuto.target === "week") return ["week", "month", "custom"].includes(interval.value);
    if (tempAuto.target === "month") return ["month", "custom"].includes(interval.value);
    if (tempAuto.target === "all" || tempAuto.target === "custom") return true;
    return false;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ color: "black" }}>
        <h3 style={{ color: "black" }}>Auto-Clear Configuration</h3>
        <p style={{ fontSize: "0.9em", color: "black", marginBottom: "10px" }}>
          <strong style={{ color: "black" }}>Current:</strong> {autoClear.interval}, {autoClear.target}
        </p>

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

        <div style={{ fontSize: "0.85em", color: "black", marginBottom: 15 }}>
          ⚠ Auto-clear applies to <strong style={{ color: "black" }}>all collections</strong>.
        </div>

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