import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const GameSettingsModal = ({ collection }) => {
  const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
  const [useGlobalSettings, setUseGlobalSettings] = useState(true);
  const [customSettings, setCustomSettings] = useState({
    gameMode: "default",
    wrongAnswerPenalty: 300,
    hintPenalty: 120,
    skipPenalty: 600,
  });
  const [globalSettings, setGlobalSettings] = useState(null);

  useEffect(() => {
    if (!collection) return;
    setUseGlobalSettings(collection.useGlobalSettings ?? true);
    setCustomSettings(
      collection.customSettings || {
        gameMode: "default",
        wrongAnswerPenalty: 300,
        hintPenalty: 120,
        skipPenalty: 600,
      }
    );
    fetchGlobalSettings();
  }, [collection]);

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/global-settings");
      const data = await response.json();
      setGlobalSettings(data);
    } catch (err) {
      console.error("Error fetching global settings:", err);
    }
  };

  const handleSaveGameSettings = async () => {
    try {
      const payload = {
        useGlobalSettings,
        customSettings: useGlobalSettings ? null : customSettings,
      };
      const res = await fetch(`http://localhost:5000/collections/${collection._id}/game-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Game settings updated successfully!");
        setShowGameSettingsModal(false);
      } else {
        const data = await res.json();
        alert(`Failed to update game settings: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating game settings:", err);
      alert("Error updating game settings. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <>
      <button
        onClick={() => setShowGameSettingsModal(true)}
        style={{
          backgroundColor: "#6f42c1",
          color: "#000",
          fontSize: "12px",
          padding: "4px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Game Settings
      </button>
      {showGameSettingsModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "25px",
                borderRadius: "10px",
                width: "80%",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
                boxSizing: "border-box",
                color: "#000",
              }}
            >
              <h3 style={{ marginBottom: "20px", textAlign: "center", color: "#000" }}>
                Game Settings - {collection?.name}
              </h3>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                  <input
                    type="checkbox"
                    checked={useGlobalSettings}
                    onChange={(e) => setUseGlobalSettings(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span style={{ fontWeight: "bold", color: "#000" }}>Use Global Default Settings</span>
                </label>
                {globalSettings && (
                  <div
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "12px",
                      borderRadius: "5px",
                      marginBottom: "15px",
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#000" }}>Global Defaults:</h4>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      <p style={{ margin: "2px 0" }}>• Game Mode: {globalSettings.defaultGameMode}</p>
                      <p style={{ margin: "2px 0" }}>
                        • Wrong Answer: +{formatTime(globalSettings.defaultWrongAnswerPenalty)}
                      </p>
                      <p style={{ margin: "2px 0" }}>
                        • Hint: +{formatTime(globalSettings.defaultHintPenalty)}
                      </p>
                      <p style={{ margin: "2px 0" }}>
                        • Skip: +{formatTime(globalSettings.defaultSkipPenalty)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {!useGlobalSettings && (
                <div style={{ marginBottom: "20px" }}>
                  <h4 style={{ marginBottom: "15px", color: "#000" }}>Custom Settings:</h4>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000" }}>
                      Game Mode:
                    </label>
                    <select
                      value={customSettings.gameMode}
                      onChange={(e) => setCustomSettings({ ...customSettings, gameMode: e.target.value })}
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        color: "#000",
                        backgroundColor: "#fff",
                      }}
                    >
                      <option value="default">📋 Default (Follow Question Order)</option>
                      <option value="random">🎲 Random (Each Game Different)</option>
                      <option value="rotating">🔄 Rotating</option>
                      <option value="rotating-reverse">🔄 Rotating Reverse</option>
                    </select>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        margin: "5px 0 0 0",
                        fontStyle: "italic",
                      }}
                    >
                      {customSettings.gameMode === "random" &&
                        "🎲 Questions will be randomized differently for each player/game session"}
                      {customSettings.gameMode === "default" &&
                        "📋 Questions follow the order you set in 'Order Questions'"}
                      {customSettings.gameMode === "rotating" &&
                        "🔄 Questions rotate in sequence for different players"}
                      {customSettings.gameMode === "rotating-reverse" &&
                        "🔄 Questions rotate in reverse sequence for different players"}
                    </p>
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000" }}
                    >
                      Wrong Answer Penalty: {formatTime(customSettings.wrongAnswerPenalty)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="600"
                      step="30"
                      value={customSettings.wrongAnswerPenalty}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, wrongAnswerPenalty: parseInt(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000" }}
                    >
                      Hint Penalty: {formatTime(customSettings.hintPenalty)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="300"
                      step="15"
                      value={customSettings.hintPenalty}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, hintPenalty: parseInt(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#000" }}
                    >
                      Skip Penalty: {formatTime(customSettings.skipPenalty)}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1200"
                      step="60"
                      value={customSettings.skipPenalty}
                      onChange={(e) =>
                        setCustomSettings({ ...customSettings, skipPenalty: parseInt(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSaveGameSettings}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#6f42c1",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowGameSettingsModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default GameSettingsModal;