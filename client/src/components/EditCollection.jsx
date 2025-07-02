import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const EditCollection = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collections`);
        const data = await res.json();
        const target = data.find((col) => col._id === id);

        if (!target) {
          setMessage("Collection not found.");
        } else {
          setName(target.name);
          setCode(target.code);
          fetchQuestions(target.code);
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setMessage("Failed to load collection.");
      }
    };

    const fetchQuestions = async (collectionCode) => {
      try {
        const res = await fetch(`http://localhost:5000/collections/${collectionCode}/questions`);
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };

    fetchCollection();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });

      if (res.ok) {
        setMessage("Collection updated successfully!");
      } else {
        const data = await res.json();
        setMessage(data.message || "Failed to update collection.");
      }
    } catch (err) {
      console.error("Update failed:", err);
      setMessage("Server error during update.");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Are you sure you want to delete this collection and all its questions?");
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/collections/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Collection deleted.");
        navigate("/admin");
      } else {
        alert("Failed to delete the collection.");
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      alert("Server error during deletion.");
    }
  };

  const handleQuestionClick = (number) => {
    navigate(`/edit-question/${number}`);
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="overlay"></div>

      <div className="buttons">
        <button
          onClick={() => navigate("/admin")}
          className="login-btn"
          style={{ backgroundColor: "#17C4C4", color: "#fff", width: "120px", marginBottom: "10px" }}
        >
          &lt; Back
        </button>

        <h2 style={{ color: "#000", fontSize: "24px", marginBottom: "10px" }}>Edit Collection</h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
          <input
            type="text"
            placeholder="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <input
            type="text"
            placeholder="Collection Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <button
            type="submit"
            className="login-btn"
            style={{
              background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
              color: "black",
              width: "100%",
              marginBottom: "10px",
            }}
          >
            Save
          </button>
        </form>

        <button
          onClick={handleDelete}
          className="login-btn"
          style={{ backgroundColor: "#DC3545", color: "#fff", width: "100%" }}
        >
          Delete Collection
        </button>

        {message && (
          <div style={{ marginTop: "10px", color: message.includes("success") ? "green" : "red" }}>
            {message}
          </div>
        )}

        <div style={{ marginTop: "30px", width: "100%", maxWidth: "300px" }}>
          <h3 style={{ color: "#000" }}>Questions in this Collection:</h3>
          {questions.length === 0 ? (
            <p style={{ color: "#555" }}>No questions found.</p>
          ) : (
            <ul style={{ padding: 0, listStyle: "none" }}>
              {questions.map((q) => (
                <li
                  key={q._id}
                  onClick={() => handleQuestionClick(q.number)}
                  style={{
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    color: "#000",
                  }}
                >
                  <strong>Q{q.number}:</strong> {q.question}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCollection;
