import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./LoginScreen.css";

const EditQuestion = () => {
  const [collections, setCollections] = useState([]);
  const [collectionId, setCollectionId] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const { number } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchQuestion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/questions/${number}`);
        if (!res.ok) throw new Error("Question not found");
        const data = await res.json();
        setQuestion(data.data.question);
        setHint(data.data.hint);
        setAnswer(data.data.answer);
        setCollectionId(data.data.collectionId);
      } catch (err) {
        console.error("Error fetching question:", err);
        alert("Failed to load question.");
      }
    };

    fetchCollections();
    fetchQuestion();
  }, [number]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = { question, hint, answer, collectionId };

    try {
      const response = await fetch(`http://localhost:5000/questions/${number}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        alert("Question updated successfully!");
      } else {
        const data = await response.json();
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
      <div className="overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate(`/edit-collection/${collectionId}`)}
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
          Edit Question #{number}
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
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
            Save
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;