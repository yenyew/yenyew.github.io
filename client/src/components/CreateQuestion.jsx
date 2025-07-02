import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css";

const CreateQuestion = () => {
  const [number, setNumber] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();

  // Fetch next question number
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:5000/questions");
        const data = await response.json();
        const maxNumber = Math.max(...data.map((q) => q.number || 0));
        setNumber(maxNumber + 1);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setNumber(1);
      }
    };

    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    };

    fetchQuestions();
    fetchCollections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const newQuestion = {
      number: parseInt(number),
      collectionId,
      question,
      hint,
      answer,
    };

    try {
      const response = await fetch("http://localhost:5000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        setMessage("Question added successfully!");
        setCollectionId("");
        setQuestion("");
        setHint("");
        setAnswer("");
        setNumber((prev) => parseInt(prev) + 1);
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.message || "Could not add question."}`);
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate("/admin")}
          className="login-btn"
          style={{
            backgroundColor: "#17C4C4",
            color: "#fff",
            width: "120px",
            marginBottom: "10px",
          }}
        >
          &lt; Admin
        </button>
      </div>

      <div className="buttons">
        <h2 style={{ fontSize: "24px", color: "#000", textAlign: "center", marginBottom: "10px" }}>
          Create a New Question:
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          <input
            type="number"
            value={number}
            onChange ={(e) => setNumber(e.target.value)}
            placeholder="Question Number"
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            required
            className="dropdown-select"
            style={{
              marginBottom: "10px",
              height: "50px",
              borderRadius: "20px",
              backgroundColor: "white",
              color: "#000",
              fontSize: "16px",
              padding: "0 10px",
              width: "100%",
              outline: "none",
            }}
          >
            <option value="">Select Collection</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="login-btn"
            style={{
              marginBottom: "10px",
              height: "100px",
              borderRadius: "20px",
              backgroundColor: "white",
            }}
          />
          <input
            type="text"
            placeholder="Hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <input
            type="text"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <button
            type="submit"
            className="login-btn"
            style={{
              background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
              color: "black",
              width: "120px",
              marginTop: "10px",
            }}
          >
            Add
          </button>
        </form>

        {message && (
          <div style={{ color: message.includes("successfully") ? "green" : "red", marginTop: "10px" }}>
            {message}
          </div>
        )}

        <a href="/" style={{ color: "#17C4C4", marginTop: "20px", fontSize: "16px" }}>
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default CreateQuestion;
