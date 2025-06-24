import React, { useState } from "react";
import "./LoginScreen.css"; // Use existing styles for consistency

const CreateQuestion = () => {
  const [number, setNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const newQuestion = {
      number: parseInt(number),
      question,
      hint,
      answer,
    };

    try {
      const response = await fetch("http://172.20.10.2:5000/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        setMessage("Question added successfully!");
        // Clear form fields
        setNumber("");
        setQuestion("");
        setHint("");
        setAnswer("");
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
            placeholder="Question Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px" }}
          />
          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", height: "100px", borderRadius: "20px" }}
          />
          <input
            type="text"
            placeholder="Hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px" }}
          />
          <input
            type="text"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px" }}
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
