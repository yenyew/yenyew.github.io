import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Questions.css";
import "./MainStyles.css";

const QuestionsBank = () => {
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
          const codeToSet = passedCode || "all";
          setCollectionCode(codeToSet);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, [passedCode, collectionCode]);

  useEffect(() => {
    if (!collectionCode) return;
    if (collectionCode === "all") {
      fetchAllQuestions();
    } else {
      fetchQuestions(collectionCode);
    }
  }, [collectionCode]);

  const fetchQuestions = async (code) => {
    try {
      const response = await fetch(`http://localhost:5000/collections/${code}/questions`);
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/questions");
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching all questions:", err);
      setQuestions([]);
    }
  };

  const getCollectionName = (collectionId) => {
    const collection = collections.find((col) => col._id === collectionId);
    return collection ? collection.name : "Unknown Collection";
  };

  const handleEdit = (number, questionCollectionId) => {
    if (collectionCode === "all") {
      if (!questionCollectionId) {
        alert("Cannot edit: Question collection ID not found.");
        return;
      }
      navigate(`/edit-question/${number}/${questionCollectionId}`);
    } else {
      const selectedCollection = collections.find((col) => col.code === collectionCode);
      if (!selectedCollection) {
        alert("Collection not selected");
        return;
      }
      navigate(`/edit-question/${number}/${selectedCollection._id}`);
    }
  };

  const handleDelete = async (number, questionCollectionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    if (!questionCollectionId) {
      alert("Collection ID not found for this question.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/questions/${number}/${questionCollectionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Question deleted.");
        setQuestions((prev) =>
          prev.filter((q) => !(q.number === number && q.collectionId === questionCollectionId))
        );
      } else {
        const data = await res.json();
        alert(`Failed to delete the question: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="scroll-wrapper">
        <div className="buttons" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <select
            value={collectionCode}
            onChange={(e) => {
              const selected = e.target.value;
              if (selected === "all") {
                navigate("/questions?collection=all");
              } else {
                navigate(`/collections/${selected}`, { state: { from: "questions" } });
              }
            }}
            style={{ padding: "6px", fontSize: "15px" }}
          >
            <option value="all">All Questions</option>
            {collections.map((col) => (
              <option key={col._id} value={col.code}>
                {col.name} Collection
              </option>
            ))}
          </select>

          <p style={{ fontSize: "16px", fontWeight: "bold", color: "#000", margin: 0 }}>
            Viewing questions in "{collectionCode === "all" ? "All Collections" : collections.find((col) => col.code === collectionCode)?.name || collectionCode}"
          </p>
        </div>

        <div style={{ maxHeight: "65vh", overflowY: "auto", width: "100%" }}>
          {questions.length === 0 ? (
            <p>No questions found.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {questions.map((q, index) => (
                <li
                  key={q._id}
                  onClick={() => navigate(`/edit-question/${q.number}/${q.collectionId}`)}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "10px",
                    marginBottom: "8px",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong>
                      {collectionCode !== "all" &&
                      collections.find((col) => col.code === collectionCode)?.questionOrder?.length > 0
                        ? `Game Q${index + 1}: (Original Q${q.number})`
                        : `Q${q.number}`}
                    </strong>
                    {collectionCode === "all" && (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {getCollectionName(q.collectionId)}
                      </span>
                    )}
                  </div>
                  <div style={{ marginBottom: "8px" }}>{q.question}</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="login-btn"
                      style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(q.number, q.collectionId);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="login-btn"
                      style={{ backgroundColor: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(q.number, q.collectionId);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button onClick={() => navigate("/add-question")} className="login-btn">
            Add New Question
          </button>
          <button onClick={() => navigate("/admin")} className="login-btn" style={{ backgroundColor: "#17C4C4" }}>
            Return
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};


export default QuestionsBank;