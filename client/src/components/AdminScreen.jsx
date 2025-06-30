import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css"; // Use existing styles

const AdminScreen = () => {
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    setSelectedQuestion(value);

    // Navigate based on selection
    if (value === "school") {
      navigate("/school-qns");
    }
    
    if (value === "individual") {
      navigate("/individual-qns");
    }
  };

  const handleNavigateToCreate = () => {
    navigate("/add-question");
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
          Which collection would you like to view or add today?
        </p>

        <div style={{ width: "120%", maxWidth: "300px", marginTop: "20px" }}>
          <select
            value={selectedQuestion}
            onChange={handleQuestionChange}
            className="centered-form"
            style={{ borderRadius: "30px", fontSize: "17px" }}
          >
            <option value="">Select a collection...</option>
            <option value="school">School</option>
            <option value="individual">Individual</option>
          </select>
        </div>

        <button
          onClick={handleNavigateToCreate}
          className="add-question-btn"
        >
          +
        </button>

        <p style={{ fontSize: "18px", color: "#000", marginTop: "10px" }}>Add Question</p>

        <a href="/" style={{ color: "#17C4C4", marginTop: "20px", fontSize: "16px" }}>
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default AdminScreen;
