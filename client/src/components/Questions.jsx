import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainStyles.css";

const QuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionCode, setCollectionCode] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(null); 
  const [collectionId, setCollectionId] = useState(null);
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
          // Set the selected collection object
          const selectedCol = data.find(col => col.code === codeToSet);
          setSelectedCollection(selectedCol);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, [passedCode, collectionCode]);

  useEffect(() => {
    const collection = collections.find(col => col.code === collectionCode);
    if (collection && collection._id) {
      setCollectionId(collection._id);
    }
  }, [collectionCode, collections]);

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

  const handleEdit = (number) => {
    if (!selectedCollection) {
      alert("Collection not selected");
      return;
    }
    // Use the same navigation pattern as EditCollection
    navigate(`/edit-question/${number}/${selectedCollection._id}`);
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

      <div className="header"><h1>GoChangi!</h1></div>

      <div className="scroll-wrapper">
        <div className="buttons">
          <select
            value={collectionCode}
            onChange={(e) => {
              const selected = e.target.value;
              setCollectionCode(selected);
              // Update selected collection when changing
              const selectedCol = collections.find(col => col.code === selected);
              setSelectedCollection(selectedCol);
              navigate(`/questions?collection=${selected}`);
            }}
            style={{ padding: "8px", fontSize: "16px", marginBottom: "16px" }}
          >
            <option value="all">All Questions</option> 
            {collections.map((col) => (
              <option key={col._id} value={col.code}>
                {col.name} Collection
              </option>
            ))}
          </select>

          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#000" }}>
            Viewing questions in "{collectionCode === "all" ? "All Collections" : collectionCode}"
          </p>

          <div style={{ maxHeight: "80vh", overflowY: "scroll", width: "100%", marginBottom: "16px" }}>
            {questions.length === 0 ? (
              <p>No questions found.</p>
            ) : (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {questions.map((q) => (
                  <li 
                    key={q._id} 
                    style={{ background: "#fff", borderRadius: "8px", padding: "10px", marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => navigate(`/edit-question/${q.number}/${q.collectionId}`)} 
                  >
                    <strong>Q{q.number}:</strong> {q.question}
                    <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigation
                          handleEdit(q.number);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent navigation
                          handleDelete(q.number, q.collectionId);
                        }}
                        style={{ background: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <button 
              onClick={() => navigate("/add-question")} 
              className="add-question"  
            >
              Add New Question
            </button>
            <button 
              onClick={() => navigate("/add-collection")} 
              className="add-collection" 
            >
              Add New Collection
            </button>
          </div>

          <button onClick={() => navigate("/admin")} className="login-btn" style={{ backgroundColor: "#17C4C4" }}>
            Back
          </button>
          <a href="/" style={{ marginTop: "16px", color: "#17C4C4" }}>Return to Home Screen</a>
        </div>
      </div>
    </div>
  );
};

export default QuestionsPage;