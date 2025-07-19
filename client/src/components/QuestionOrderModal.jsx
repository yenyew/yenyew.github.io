import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const QuestionOrderModal = ({ collection, questions, setQuestions }) => {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderedQuestions, setOrderedQuestions] = useState([]);

  useEffect(() => {
    if (collection?.questionOrder?.length > 0) {
      const collectionQuestions = questions.filter((q) => q.collectionId === collection._id);
      setOrderedQuestions(collectionQuestions);
    } else {
      const collectionQuestions = questions.filter((q) => q.collectionId === collection._id);
      const sortedQuestions = [...collectionQuestions].sort((a, b) => a.number - b.number);
      setOrderedQuestions(sortedQuestions);
    }
  }, [collection, questions]);

  const quickSortAscending = () => {
    const sorted = [...orderedQuestions].sort((a, b) => a.number - b.number);
    setOrderedQuestions(sorted);
  };

  const quickSortDescending = () => {
    const sorted = [...orderedQuestions].sort((a, b) => b.number - a.number);
    setOrderedQuestions(sorted);
  };

  const quickSortRandom = () => {
    const shuffled = [...orderedQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrderedQuestions(shuffled);
  };

  const handleSaveOrder = async () => {
    try {
      const questionIds = orderedQuestions.map((q) => q._id);
      const res = await fetch(`http://localhost:5000/collections/${collection._id}/question-order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionOrder: questionIds }),
      });

      if (res.ok) {
        alert("Question order updated successfully!");
        setShowOrderModal(false);
        const response = await fetch(`http://localhost:5000/collections/${collection.code}/questions`);
        const data = await response.json();
        setQuestions(Array.isArray(data) ? data : data.questions || []);
      } else {
        const data = await res.json();
        alert(`Failed to update question order: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating question order:", err);
      alert("Error updating question order. Please try again.");
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= orderedQuestions.length) return;
    const newQuestions = [...orderedQuestions];
    const movedQuestion = newQuestions.splice(fromIndex, 1)[0];
    newQuestions.splice(toIndex, 0, movedQuestion);
    setOrderedQuestions(newQuestions);
  };

  return (
    <>
      <button
        onClick={() => setShowOrderModal(true)}
        style={{
          backgroundColor: "#28a745",
          color: "#000",
          fontSize: "12px",
          padding: "4px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Order Questions
      </button>
      {showOrderModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 10000,
            }}
          >
            <div
              className="modal-content"
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "10px",
                width: "80%",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
                boxSizing: "border-box",
                color: "#000",
              }}
            >
              <h3 style={{ marginBottom: "20px", textAlign: "center", color: "#000" }}>Reorder Questions</h3>
              <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
                <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                  <strong>Instructions:</strong> Use the Up/Down buttons to change question order in the game. The first question will be "Game Q1", second will be "Game Q2", etc.
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={quickSortAscending}
                    style={{
                      backgroundColor: "#17a2b8",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Sort Ascending
                  </button>
                  <button
                    onClick={quickSortDescending}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Sort Descending
                  </button>
                  <button
                    onClick={quickSortRandom}
                    style={{
                      backgroundColor: "#fd7e14",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Random Shuffle
                  </button>
                </div>
              </div>
              {orderedQuestions.length === 0 ? (
                <p style={{ textAlign: "center", color: "#666" }}>No questions found in this collection.</p>
              ) : (
                <div style={{ marginBottom: "20px" }}>
                  {orderedQuestions.map((q, index) => (
                    <div
                      key={q._id}
                      style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #dee2e6",
                        padding: "12px",
                        marginBottom: "8px",
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#28a745",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          minWidth: "60px",
                          textAlign: "center",
                        }}
                      >
                        Game Q{index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", marginBottom: "4px", color: "#000" }}>
                          Original Q{q.number}
                        </div>
                        <div style={{ fontSize: "14px", color: "#666" }}>{q.question.substring(0, 80)}...</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button
                          onClick={() => moveQuestion(index, index - 1)}
                          disabled={index === 0}
                          style={{
                            backgroundColor: index === 0 ? "#ccc" : "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "3px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            cursor: index === 0 ? "not-allowed" : "pointer",
                            minWidth: "40px",
                          }}
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveQuestion(index, index + 1)}
                          disabled={index === orderedQuestions.length - 1}
                          style={{
                            backgroundColor: index === orderedQuestions.length - 1 ? "#ccc" : "#007bff",
                            color: "#fff",
                            border: "none",
                            borderRadius: "3px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            cursor: index === orderedQuestions.length - 1 ? "not-allowed" : "pointer",
                            minWidth: "40px",
                          }}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSaveOrder}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "bold",
                  }}
                >
                  Save Order
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    backgroundColor: "#6c757d",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default QuestionOrderModal;