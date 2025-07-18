import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MainStyles.css";
const EditCollection = () => {
  const { id } = useParams();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [sortOrder, setSortOrder] = useState("asc");
  const navigate = useNavigate();
  const pageSize = 6;

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
    
    const fetchCollection = async () => {
      try {
        const res = await fetch(`http://localhost:5000/collections`);
        const data = await res.json();
        const target = data.find((col) => col._id === id);

        if (target) {
          setName(target.name);
          setCode(target.code);
          fetchQuestions(target.code, target._id); // ✅ pass both
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
      }
    };

    const fetchQuestions = async (collectionCode, collectionId) => {
      try {
        const res = await fetch(`http://localhost:5000/collections/${collectionCode}/questions`);
        const data = await res.json();

        const withCollectionId = (data.questions || []).map((q) => ({
          ...q,
          collectionId: collectionId, 
        }));

        setQuestions(withCollectionId);
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };

    fetchCollection();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });

      if (res.ok) alert("Collection updated successfully!");
      else alert("Failed to update collection.");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Server error during update.");
    }
  };

  const handleDeleteCollection = async () => {
    const confirm = window.confirm("Delete this entire collection and all its questions?");
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

  const handleDeleteQuestion = async (number) => {
    const confirm = window.confirm(`Delete Question ${number}?`);
    if (!confirm) return;

    try {
      const response = await fetch(`http://localhost:5000/questions/${number}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert(`Question ${number} deleted.`);
        const updated = questions.filter((q) => q.number !== number);
        setQuestions(updated);
      } else {
        const data = await response.json();
        alert(`Failed to delete question: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting question:", err);
      alert("Server error during deletion.");
    }
  };

  const handleQuestionClick = (number, collectionId) => {
    navigate(`/edit-question/${number}/${collectionId}`);
  };

  const sortedQuestions = [...questions];
  if (sortOrder === "asc") sortedQuestions.sort((a, b) => a.number - b.number);
  else if (sortOrder === "desc") sortedQuestions.sort((a, b) => b.number - a.number);
  else if (sortOrder === "random") sortedQuestions.sort(() => Math.random() - 0.5);

  const totalPages = Math.ceil(sortedQuestions.length / pageSize);
  const pagedQuestions = sortedQuestions.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

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
          &lt; Back
        </button>
      </div>

      <div className="buttons">
        <h2 style={{ color: "#000", fontSize: "24px", marginBottom: "10px" }}>
          Edit Collection
        </h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
          <input
            type="text"
            placeholder="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-btn"
            style={{
              marginBottom: "8px",
              backgroundColor: "white",
              padding: "10px",
              fontSize: "14px",
            }}
          />
          <input
            type="text"
            placeholder="Collection Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="login-btn"
            style={{
              marginBottom: "8px",
              backgroundColor: "white",
              padding: "10px",
              fontSize: "14px",
            }}
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
          onClick={handleDeleteCollection}
          className="login-btn"
          style={{ backgroundColor: "#DC3545", color: "#fff", width: "100%" }}
        >
          Delete Collection
        </button>

        <div style={{ marginTop: "30px", width: "100%", maxWidth: "300px" }}>
          <h3 style={{ color: "#000" }}>Questions in this Collection:</h3>

          <label style={{ fontWeight: "bold", color: "#000", fontSize: "14px", marginBottom: "4px" }}>
            Sort Questions By:
          </label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              marginBottom: "10px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "white",
              color: "#000",
              fontSize: "14px",
              padding: "0 8px",
              width: "100%",
              outline: "none",
            }}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
            <option value="random">Random</option>
          </select>

          {questions.length === 0 ? (
            <p style={{ color: "#555" }}>No questions found.</p>
          ) : (
            <>
              <ul style={{ padding: 0, listStyle: "none" }}>
                {pagedQuestions.map((q) => {
                  const truncated =
                    q.question.length > 60
                      ? q.question.slice(0, 60) + "..."
                      : q.question;
                  return (
                    <li
                      key={q._id}
                      title={q.question}
                      style={{
                        backgroundColor: "#fff",
                        padding: "6px 8px",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        color: "#000",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "14px",
                      }}
                    >
                      <span
                        onClick={() => handleQuestionClick(q.number, q.collectionId)}
                        style={{
                          cursor: "pointer",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          paddingRight: "6px",
                        }}
                      >
                        <strong>Q{q.number}:</strong> {truncated}
                      </span>
                      <button
                        onClick={() => handleDeleteQuestion(q.number)}
                        style={{
                          backgroundColor: "#DC3545",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "14px",
                          marginLeft: "6px",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="login-btn"
                  style={{ width: "48%" }}
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="login-btn"
                  style={{ width: "48%" }}
                >
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditCollection;
