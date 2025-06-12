import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css"; // Use existing styles

const AdminScreen = () => {
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:5000/questions");
        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }
        const data = await response.json();
        setQuestions(data);
      } catch (err) {
        console.error("Error fetching questions:", err);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionChange = (e) => {
    const value = e.target.value;
    const selectedObj = questions.find((q) => q.question === value);
    setSelectedQuestion(value);
    setSelected(selectedObj || null);
  };

  const handleNavigateToCreate = () => {
    navigate("/add-question");
  };

  const handleDelete = async () => {
    if (!selected) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`http://localhost:5000/questions/${selected.number}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Question deleted.");
        setQuestions(prev => prev.filter(q => q.number !== selected.number));
        setSelected(null);
        setSelectedQuestion("");
      } else {
        alert("Failed to delete question.");
      }
    } catch (err) {
      alert("Error deleting question.");
    }
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
          Which questions would you like to add/edit/delete today?
        </p>

        <div style={{ width: "80%", maxWidth: "300px", marginTop: "20px" }}>
          <select
            value={selectedQuestion}
            onChange={handleQuestionChange}
            className="login-btn"
            style={{ borderRadius: "30px", fontSize: "18px" }}
          >
            <option value="">Select a question...</option>
            {questions.map((q) => (
              <option key={q._id} value={q.question}>
                Q{q.number}: {q.question}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleNavigateToCreate}
          className="login-btn"
          style={{
            background: "white",
            border: "2px solid #17C4C4",
            borderRadius: "50%",
            width: "60px",
            height: "60px",
            fontSize: "32px",
            marginTop: "20px",
            color: "#17C4C4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: "0"
          }}
        >
          +
        </button>

        <p style={{ fontSize: "18px", color: "#000", marginTop: "10px" }}>Add Question</p>

        {selected && (
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              className="login-btn"
              style={{ backgroundColor: "#FFC107", color: "black" }}
              onClick={() => navigate(`/edit-question/${selected.number}`)}
            >
              Edit Question
            </button>
            <button
              className="login-btn"
              style={{ backgroundColor: "#DC3545", color: "black" }}
              onClick={handleDelete}
            >
              Delete Question
            </button>
          </div>
        )}

        <a href="/" style={{ color: "#17C4C4", marginTop: "20px", fontSize: "16px" }}>
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default AdminScreen;
