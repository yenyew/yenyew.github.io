import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css";

const AdminScreen = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, [navigate]);

  const handleCollectionChange = (e) => {
    const id = e.target.value;
    setSelectedCollectionId(id);
    if (id) {
      navigate(`/edit-collection/${id}`);
    }
  };

  const handleCreateQuestion = () => {
    navigate("/add-question");
  };

  const handleCreateCollection = () => {
    navigate("/add-collection");
  };

  const handleViewLeaderboard = () => {
    navigate("/admin-leaderboard");
  };

  return (
    <div className="login-container">
      <img
        src="/images/changihome.jpg"
        alt="Background"
        className="background-image"
      />
      <div className="page-overlay"></div>

      <div className="header">
        <h2>GoChangi!</h2>
      </div>

      <div className="buttons">
        <p style={{ fontSize: "18px", textAlign: "center", color: "#000" }}>
          Which collection would you like to view?
        </p>

        <div style={{ width: "100%", maxWidth: "300px", marginTop: "16px" }}>
          <select
            value={selectedCollectionId}
            onChange={handleCollectionChange}
            className="centered-form"
            style={{
              borderRadius: "30px",
              fontSize: "16px",
              padding: "10px 16px",
              width: "100%",
            }}
          >
            <option value="">Select a collection...</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.name} ({col.code})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <button onClick={handleCreateCollection} className="add-question-btn">+</button>
          <span style={{ fontSize: "18px", color: "#007b8a", fontWeight: "600" }}>Collection</span>
          <button onClick={handleCreateQuestion} className="add-question-btn">+</button>
          <span style={{ fontSize: "18px", color: "#007b8a", fontWeight: "600" }}>Question</span>
        </div>

        <button
          onClick={handleViewLeaderboard}
          className="login-btn"
          style={{ marginTop: "24px", width: "100%", maxWidth: "300px", backgroundColor: "#007b8a" }}
        >
          View Leaderboard
        </button>

        <button
          onClick={() => navigate("/")}
          className="login-btn"
          style={{ marginTop: "16px", width: "100%", maxWidth: "300px" }}
        >
          Return to Home Screen
        </button>
      </div>
    </div>
  );
};

export default AdminScreen;
