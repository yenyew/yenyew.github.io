import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

const AdminScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <img
        src="/images/changihome.jpg"
        alt="Background"
        className="background-image"
      />
      <div className="page-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="buttons">
        <h1 style={{ color: "#000", fontSize: "32px", textAlign: "center", marginBottom: "20px" }}>
          Admin Dashboard
        </h1>

        <button
          onClick={() => navigate("/questions")}
          className="login-btn"
          style={{ marginTop: "8px", width: "100%", maxWidth: "300px", backgroundColor: "#28a745", color: "#000" }}
        >
          View and Edit Questions
        </button>

        <button
          onClick={() => navigate("/collections-bank")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", backgroundColor: "#17a2b8", color: "#000" }}
        >
          View and Edit Collections
        </button>

        <button
          onClick={() => navigate("/landing-customisation")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", backgroundColor: "#e67e22", color: "#000" }}
        >
          Customise Landing Page
        </button>

        <button
          onClick={() => navigate("/global-game-settings")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", backgroundColor: "#6f42c1", color: "#000" }}
        >
          Default Game Settings
        </button>

        <button
          onClick={() => navigate("/admin-leaderboard")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", backgroundColor: "#007b8a", color: "#000" }}
        >
          View Leaderboard
        </button>

        <button
          onClick={() => navigate("/bad-usernames")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", backgroundColor: "#cc4125", color: "#000" }}
        >
          Manage Bad Usernames
        </button>



        <button
          onClick={() => {
            localStorage.removeItem("jwtToken");
            navigate("/login");
          }}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px", color: "#000" }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default AdminScreen;