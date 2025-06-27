import React, { useEffect, useState } from "react";
import "./LoginScreen.css";

const CreateQuestion = () => {
  const [number, setNumber] = useState("");
  const [collection, setCollection] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  // Fetch existing questions to determine next number
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:5000/questions");
        const data = await response.json();
        const maxNumber = Math.max(...data.map(q => q.number || 0));
        const nextNumber = maxNumber + 1;
        setNumber(nextNumber);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        setNumber(1); // fallback
      }
    };
    fetchQuestions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const newQuestion = {
      number: parseInt(number),
      collection,
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
        setQuestion("");
        setHint("");
        setAnswer("");
        setNumber((prev) => parseInt(prev) + 1); // auto-increment for next entry
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
        <a
          href="/admin"
          style={{ color: "#000", textDecoration: "underline", fontSize: "18px", marginBottom: "10px" }}
        >
          &lt;Back
        </a>
      </div>

      <div className="buttons">
        <h2 style={{ fontSize: "24px", color: "#000", textAlign: "center", marginBottom: "10px" }}>
          Create a New Question:
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          <input
            type="number"
            value={number}
            readOnly
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <textarea
            placeholder="Collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", height: "50px", borderRadius: "20px", backgroundColor: "white" }}
          />
          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", height: "100px", borderRadius: "20px", backgroundColor: "white" }}
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

        <a
          href="/"
          style={{
            color: "#17C4C4",
            marginTop: "20px",
            fontSize: "16px",
          }}
        >
          Return to Home Screen
        </a>
      </div>
    </div>
  );
};

export default CreateQuestion;
