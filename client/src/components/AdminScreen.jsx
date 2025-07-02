import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css";

const AdminScreen = () => {
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [collections, setCollections] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    } else {
      fetchCollections();

    }

    // Fetch collections from backend
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

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setSelectedQuestion(value);
    if (value) {
      navigate(`/questions?collection=${value}`);
      
  const fetchCollections = async () => {
    try {
      const res = await fetch("http://localhost:5000/collections");
      const data = await res.json();
      setCollections(data);
    } catch (err) {
      console.error("Failed to load collections:", err);
    }
  };

  const handleCollectionChange = (e) => {
    const id = e.target.value;
    setSelectedCollectionId(id);

    if (id) {
      navigate(`/edit-collection/${id}`); // ✅ Use the actual selected value, not outdated state
    }
  };



  const handleCreateQuestion = () => {
    navigate("/add-question");
  };

  const handleCreateCollection = () => {
    navigate("/add-collection");
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="overlay"></div>

      <div className="header">
        <h1 style={{ fontSize: "48px", fontFamily: "serif", fontWeight: "bold", margin: 0 }}>
          GoChangi!
        </h1>
      </div>

      <div className="buttons">
        <p style={{ fontSize: "20px", textAlign: "center", color: "#000", maxWidth: "300px" }}>
          Which collection would you like to view?
        </p>

        <div style={{ width: "120%", maxWidth: "300px", marginTop: "20px" }}>
          <select
            value={selectedCollectionId}
            onChange={handleCollectionChange}
            className="centered-form"
            style={{ borderRadius: "30px", fontSize: "17px" }}
          >
            <option value="">Select a collection...</option>
            {collections.map((col) => (

              <option key={col._id} value={col.code}>
                {col.name}

              <option key={col._id} value={col._id}>
                {col.name} ({col.code})
              </option>
            ))}
          </select>
        </div>

        <button onClick={handleNavigateToCreate} className="add-question-btn">
          +
        </button>

        <div style={{ marginTop: "30px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <button onClick={handleCreateCollection} className="add-question-btn">+ Collection</button>
          <button onClick={handleCreateQuestion} className="add-question-btn">+ Question</button>
        </div>

        <p style={{ fontSize: "18px", color: "#000", marginTop: "10px" }}>
          Add New Content
        </p>

        <a href="/" style={{ color: "#17C4C4", marginTop: "20px", fontSize: "16px" }}>
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default AdminScreen;
