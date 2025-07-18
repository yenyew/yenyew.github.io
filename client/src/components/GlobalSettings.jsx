import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

const GlobalSettings = () => {
  const [settings, setSettings] = useState({
    defaultGameMode: 'default',
    defaultWrongAnswerPenalty: 300,
    defaultHintPenalty: 120,
    defaultSkipPenalty: 600
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
    
    fetchGlobalSettings();
  }, [navigate]);

  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/global-settings");
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error("Error fetching global settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/global-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Global settings updated successfully!");
      } else {
        const data = await response.json();
        alert(`Failed to update settings: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="scroll-wrapper">
        <div className="buttons">
          <h1 style={{ color: "#000", fontSize: "24px", textAlign: "center", marginBottom: "15px" }}>
            Default Game Settings
          </h1>

          <form onSubmit={handleSave} style={{ width: "100%", maxWidth: "500px" }}>
            <div style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.95)", 
              padding: "20px", 
              borderRadius: "10px", 
              marginBottom: "15px" 
            }}>
              
              {/* Game Mode Section */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#333" }}>
                  Default Game Mode:
                </label>
                <select
                  value={settings.defaultGameMode}
                  onChange={(e) => setSettings({...settings, defaultGameMode: e.target.value})}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    fontSize: "14px"
                  }}
                >
                  <option value="default">Default - Same order for all players</option>
                  <option value="random">Random - Different order for each player</option>
                  <option value="rotating">Rotating - Players start at different questions</option>
                  <option value="rotating-reverse">Rotating Reverse - Reverse rotating start</option>
                </select>
              </div>

              {/* Penalty Settings */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ color: "#333", marginBottom: "12px", fontSize: "16px" }}>Default Penalty Times:</h3>
                
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                    Wrong Answer: {formatTime(settings.defaultWrongAnswerPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="30"
                    value={settings.defaultWrongAnswerPenalty}
                    onChange={(e) => setSettings({...settings, defaultWrongAnswerPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%", marginBottom: "3px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
                    <span>0s</span>
                    <span>10m</span>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                    Hint: {formatTime(settings.defaultHintPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="15"
                    value={settings.defaultHintPenalty}
                    onChange={(e) => setSettings({...settings, defaultHintPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%", marginBottom: "3px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
                    <span>0s</span>
                    <span>5m</span>
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold", color: "#333", fontSize: "14px" }}>
                    Skip: {formatTime(settings.defaultSkipPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="60"
                    value={settings.defaultSkipPenalty}
                    onChange={(e) => setSettings({...settings, defaultSkipPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%", marginBottom: "3px" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
                    <span>0s</span>
                    <span>20m</span>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "12px", 
                borderRadius: "5px", 
                marginBottom: "15px" 
              }}>
                <h4 style={{ margin: "0 0 8px 0", color: "#333", fontSize: "14px" }}>Preview:</h4>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  <p style={{ margin: "3px 0" }}>• Mode: <strong>{settings.defaultGameMode}</strong></p>
                  <p style={{ margin: "3px 0" }}>• Wrong Answer: <strong>+{formatTime(settings.defaultWrongAnswerPenalty)}</strong></p>
                  <p style={{ margin: "3px 0" }}>• Hint: <strong>+{formatTime(settings.defaultHintPenalty)}</strong></p>
                  <p style={{ margin: "3px 0" }}>• Skip: <strong>+{formatTime(settings.defaultSkipPenalty)}</strong></p>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#6f42c1",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Save Global Settings
              </button>
            </div>
          </form>

          <button 
            onClick={() => navigate("/admin")} 
            className="login-btn" 
            style={{ backgroundColor: "#17C4C4", maxWidth: "300px" }}
          >
            Back to Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettings;