import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

const CreateQuestion = () => {
  const [number, setNumber] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [funFact, setFunFact] = useState("");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState([]);
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
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    };

    fetchCollections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validation for empty fields
    if (!number || number.trim() === "") {
      alert("Please enter a question number.");
      return;
    }

    if (!collectionId || collectionId.trim() === "") {
      alert("Please select a collection.");
      return;
    }

    if (!question || question.trim() === "") {
      alert("Please enter a question description.");
      return;
    }

    if (!answer || answer.trim() === "") {
      alert("Please enter an answer.");
      return;
    }

    // Optional: Validate that question number is a positive integer
    const questionNumber = parseInt(number);
    if (isNaN(questionNumber) || questionNumber <= 0) {
      alert("Please enter a valid positive question number.");
      return;
    }

    // Optional: Validate that answer is not just commas
    const trimmedAnswers = answer.split(",").map(ans => ans.trim()).filter(ans => ans.length > 0);
    if (trimmedAnswers.length === 0) {
      alert("Please enter at least one valid answer.");
      return;
    }

    try {
      const allRes = await fetch("http://localhost:5000/questions");
      const allQuestions = await allRes.json();

      const exists = allQuestions.some(
        (q) => q.number === parseInt(number) && q.collectionId === collectionId
      );

      if (exists) {
        alert("A question with that number already exists in the selected collection.");
        return;
      }

      const newQuestion = {
        number: parseInt(number),
        collectionId,
        question: question.trim(),
        hint: hint.trim(),
        answer: trimmedAnswers, // Use the filtered answers
        funFact: funFact.trim()
      };

      const response = await fetch("http://localhost:5000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        alert("Question added successfully!");
        setCollectionId("");
        setQuestion("");
        setHint("");
        setAnswer("");
        setNumber("");
        setFunFact("");
      } else {
        const data = await response.json();
        alert(`Error: ${data.message || "Could not add question."}`);
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="header">
        <button
          onClick={() => navigate("/questions")}
          className="login-btn"
          style={{
            backgroundColor: "#17C4C4",
            color: "#fff",
            width: "120px",
            marginBottom: "10px",
          }}
        >
          &lt; Back
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
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Question Number"
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
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
            placeholder="Hint (Optional)"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
            Enter multiple acceptable answers, separated by commas.
          </p>
          <input
            type="text"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <input
            type="text"
            placeholder="Fun Fact (Optional)"
            value={funFact}
            onChange={(e) => setFunFact(e.target.value)}
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
          <div style={{ color: "red", marginTop: "10px" }}>{message}</div>
        )}
      </div>
    </div>
  );
};

export default CreateQuestion;