import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import QuestionOrderModal from "./QuestionOrderModal";
import GameSettingsModal from "./GameSettingsModal";
import EditCollectionModal from "./EditCollectionModal";

import "./Questions.css";
import "./MainStyles.css";

const EditCollection = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const location = useLocation();
  const fromPage = location.state?.from || "questions"; // default to 'questions'

  const navigate = useNavigate();
  const { code } = useParams();  useEffect(() => {
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
        const selectedCol = data.find((col) => col.code === code);
        if (selectedCol) {
          setSelectedCollection(selectedCol);
        } else {
          console.error("Collection not found");
          navigate(fromPage === "collections" ? "/collections-bank" : "/questions?collection=all");
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
        navigate(fromPage === "collections" ? "/collections-bank" : "/questions?collection=all");
      }
    };
    if (code) fetchCollections();
  }, [code, navigate]);  

  useEffect(() => {
    if (!code || !selectedCollection) return;
    fetchQuestions(code);
  }, [code, selectedCollection]);  const fetchQuestions = async (code) => {
    try {
      const response = await fetch(`http://localhost:5000/collections/${code}/questions`);
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    }
  };  const handleEditCollection = (collection) => {
    setEditCollection(collection);
    setShowCollectionModal(true);
  };  const handleDeleteCollection = async (collection) => {
    if (!window.confirm(`Are you sure you want to delete "${collection.name}" collection? This will also delete all questions in this collection!`)) return;
try {
  const res = await fetch(`http://localhost:5000/collections/${collection._id}`, {
    method: "DELETE",
  });

  if (res.ok) {
    alert("Collection deleted successfully!");
    navigate(fromPage === "collections" ? "/collections-bank" : "/questions?collection=all");
  } else {
    const data = await res.json();
    alert(`Failed to delete collection: ${data.message}`);
  }
} catch (err) {
  console.error("Error deleting collection:", err);
  alert("Error deleting collection. Please try again.");
}  };  


const handleCollectionUpdated = (updatedCollection) => {
      setSelectedCollection(updatedCollection);
      setShowCollectionModal(false);
      setEditCollection(null);
      navigate(`/collections/${updatedCollection.code}`, { state: { from: fromPage } });
    };

    return (
      <div className="login-container">
        <img src="/images/changihome.jpg" alt="Background" className="background-image" />
        <div className="page-overlay"></div>
        <div className="top-left-logo">
          <img src="/images/ces.jpg" alt="Changi Experience Studio" />
        </div>  <div className="scroll-wrapper">
      <div className="buttons">
        <p style={{ fontSize: "18px", fontWeight: "bold", color: "#000", marginTop: "100px" }}>
          Managing Collection: "{selectedCollection?.name || code}"
        </p>

        {selectedCollection && (
          <div
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleEditCollection(selectedCollection)}
                style={{
                  backgroundColor: "#FFC107",
                  color: "#000",
                  fontSize: "12px",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Edit Collection
              </button>
              <button
                onClick={() => handleDeleteCollection(selectedCollection)}
                style={{
                  backgroundColor: "#DC3545",
                  color: "#000",
                  fontSize: "12px",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete Collection
              </button>
              <QuestionOrderModal
                collection={selectedCollection}
                questions={questions}
                setQuestions={setQuestions}
              />
              <GameSettingsModal collection={selectedCollection} />
            </div>
          </div>
        )}

        <div style={{ maxHeight: "80vh", overflowY: "scroll", width: "100%", marginBottom: "16px" }}>
          {questions.length === 0 ? (
            <p>No questions found in this collection.</p>
          ) : (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {questions.map((q, index) => (
                <li
                  key={q._id}
                  style={{ background: "#fff", borderRadius: "8px", padding: "10px", marginBottom: "8px", cursor: "pointer" }}
                  onClick={() => navigate(`/edit-question/${q.number}/${q.collectionId}`)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px" }}>
                    <strong>
                      {selectedCollection?.questionOrder?.length > 0 ? `Game Q${index + 1}: (Original Q${q.number})` : `Q${q.number}`}
                    </strong>
                  </div>
                  <div style={{ marginBottom: "8px" }}>{q.question}</div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="login-btn"
                      style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-question/${q.number}/${q.collectionId}`);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this question?")) {
                          fetch(`http://localhost:5000/questions/${q.number}/${q.collectionId}`, { method: "DELETE" })
                            .then((res) => {
                              if (res.ok) {
                                alert("Question deleted.");
                                setQuestions((prev) =>
                                  prev.filter(
                                    (question) => !(question.number === q.number && question.collectionId === q.collectionId)
                                  )
                                );
                              } else {
                                res.json().then((data) => alert(`Failed to delete the question: ${data.message}`));
                              }
                            })
                            .catch((err) => console.error("Error deleting question:", err));
                        }
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
            onClick={() => {
              if (fromPage === "collections") {
                navigate("/collections");
              } else {
                navigate("/questions?collection=all");
              }
            }}
            className="login-btn"
            style={{ backgroundColor: "#17C4C4" }}
          >
            Return
          </button>
        </div>

        {showCollectionModal && editCollection && (
          <EditCollectionModal
            collection={editCollection}
            onClose={() => setShowCollectionModal(false)}
            onCollectionUpdated={handleCollectionUpdated}
          />
        )}
      </div>
    </div>
  </div>  
);
};

export default EditCollection;

