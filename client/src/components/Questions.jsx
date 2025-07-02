import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Questions.css";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionCode, setCollectionCode] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const passedCode = queryParams.get("collection");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(data);
        if (data.length > 0 && !collectionCode) {
          const codeToSet = passedCode || data[0].code;
          setCollectionCode(codeToSet);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    fetchCollections();
    const interval = setInterval(fetchCollections, 1000);
    return () => clearInterval(interval);
  }, [passedCode, collectionCode]);

  useEffect(() => {
    if (!collectionCode) return;

    fetchQuestions(collectionCode);
    const interval = setInterval(() => fetchQuestions(collectionCode), 1000);
    return () => clearInterval(interval);
  }, [collectionCode]);

  const fetchQuestions = async (code) => {
    try {
      const response = await fetch(`http://localhost:5000/collections/${code}/questions`);
      if (!response.ok) throw new Error("Failed to fetch questions");
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
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
        setQuestions((prev) => prev.filter((q) => q.number !== number));
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

      <div className="scroll-wrapper">
        <div className="buttons">
          <select
            value={collectionCode}
            onChange={(e) => {
              const selected = e.target.value;
              setCollectionCode(selected);
              navigate(`/questions?collection=${selected}`);
            }}
            style={{ marginBottom: "20px", padding: "8px", fontSize: "16px" }}
          >
            {collections.map((col) => (
              <option key={col._id} value={col.code}>
                {col.name} Collection
              </option>
            ))}
          </select>

          <p style={{ fontSize: "20px", textAlign: "center", color: "#000", maxWidth: "300px", marginBottom: "20px" }}>
            Questions under the "{collectionCode}" Collection:
          </p>

          {questions.length === 0 ? (
            <p style={{ fontSize: "18px", textAlign: "center", color: "#555" }}>No questions found.</p>
          ) : (
            <ul style={{ padding: 0, listStyleType: "none", width: "100%" }}>
              {questions.map((q) => (
                <li
                  key={q._id}
                  style={{
                    backgroundColor: "#fff",
                    padding: "10px 15px",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    color: "#000",
                    fontSize: "16px",
                    wordBreak: "break-word"
                  }}
                >
                  <div>
                    <strong>Q{q.number}:</strong>{" "}
                    {typeof q.question === "string" && q.question.length > 100
                      ? q.question.slice(0, 100) + "..."
                      : String(q.question || "")}
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
    </div>
  );
};

export default QuestionsPage;
