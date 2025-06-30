import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css"; // Reuse the same styles

const IndividualQns = () => {
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
    fetchIndividualQuestions();
  }, []);

  const fetchIndividualQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/collections/individual/questions");
      if (!response.ok) throw new Error("Failed to fetch individual questions");
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching individual questions:", err);
      setQuestions([]);
    }
  };

  const handleEdit = (number) => {
    navigate(`/edit-question/${number}`);
  };

  const handleDelete = async (number) => {
    const confirm = window.confirm("Are you sure you want to delete this question?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/questions/${number}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Question deleted.");
        setQuestions(prev => prev.filter(q => q.number !== number));
      } else {
        alert("Failed to delete the question.");
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Server error while deleting.");
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

      <div className="buttons" style={{ maxHeight: "70vh", overflowY: "auto" }}>
        <p style={{ fontSize: "20px", textAlign: "center", color: "#000", maxWidth: "300px", marginBottom: "20px" }}>
          Questions under the "Individual" Collection:
        </p>

        {questions.length === 0 ? (
          <p style={{ fontSize: "18px", textAlign: "center", color: "#555" }}>No questions found.</p>
        ) : (
          <ul style={{ padding: 0, listStyleType: "none" }}>
            {questions.map((q) => (
              <li key={q._id} style={{ backgroundColor: "#fff", padding: "10px 15px", borderRadius: "12px", marginBottom: "10px", color: "#000", fontSize: "16px" }}>
                <div>
                  <strong>Q{q.number}:</strong> {q.question}
                </div>
                <div style={{ marginTop: "8px", display: "flex", gap: "10px" }}>
                  <button
                    className="login-btn"
                    style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                    onClick={() => handleEdit(q.number)}
                  >
                    Edit
                  </button>
                  <button
                    className="login-btn"
                    style={{ backgroundColor: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                    onClick={() => handleDelete(q.number)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/admin")}
            className="login-btn"
            style={{ backgroundColor: "#17C4C4", color: "#fff" }}
          >
            Back
          </button>
        </div>

        <a href="/" style={{ color: "#17C4C4", marginTop: "20px", fontSize: "16px", display: "block" }}>
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default IndividualQns;
