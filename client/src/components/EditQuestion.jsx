import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MainStyles.css";

const EditQuestion = () => {
  const { number, collectionId } = useParams();
  const navigate = useNavigate();

  const [collectionName, setCollectionName] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [funFact, setFunFact] = useState("");
  const [type, setType] = useState("open");
  const [options, setOptions] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    if (!collectionId) {
      alert("Missing collection ID.");
      navigate("/questions");
      return;
    }

    const fetchCollectionName = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        const target = data.find((col) => col._id === collectionId);
        if (target) setCollectionName(target.name || "");
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchQuestion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`);
        if (!res.ok) throw new Error("Question not found");
        const data = await res.json();
        const q = data.data;
        setQuestion(q.question);
        setHint(q.hint);
        setAnswer(Array.isArray(q.answer) ? q.answer.join(", ") : q.answer);
        setFunFact(q.funFact || "");
        setType(q.type || "open");
        setOptions(Array.isArray(q.options) ? q.options.join(", ") : "");
      } catch (err) {
        console.error("Error fetching question:", err);
        alert("Failed to load question.");
      }
    };

    fetchCollectionName();
    fetchQuestion();
  }, [number, collectionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedQuestion = {
        question,
        hint,
        funFact,
        answer: answer.split(",").map(ans => ans.trim()),
        type,
        ...(type === "mcq" && { options: options.split(",").map(opt => opt.trim()) }),
      };

      const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedQuestion),
      });

      if (res.ok) {
        alert("Question updated successfully!");
        navigate(`/questions`);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "Update failed"}`);
      }
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate(`/questions`)}
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
          Edit {collectionName} Question #{number}
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
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

          {type === "mcq" && (
            <>
              <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
                Edit MCQ options (comma-separated):
              </p>
              <input
                type="text"
                placeholder="Options (e.g., A,B,C,D)"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="login-btn"
                style={{ marginBottom: "10px", backgroundColor: "white" }}
              />
            </>
          )}

          <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
            {type === "mcq" ? "Correct options (comma-separated):" : "Acceptable answers (comma-separated):"}
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
            placeholder="Fun fact"
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
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
