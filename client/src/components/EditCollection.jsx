// EditCollection.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QuestionOrderModal from "./QuestionOrderModal";
import GameSettingsModal from "./GameSettingsModal";
import EditCollectionModal from "./EditCollectionModal";
import AlertModal from "./AlertModal";
import "./Questions.css";
import "./MainStyles.css";

const EditCollection = () => {
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // global modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [onConfirmAction, setOnConfirmAction] = useState(() => {});

  const [questionToDelete, setQuestionToDelete] = useState(null);

  const location = useLocation();
  const fromPage = location.state?.from || "questions";
  const navigate = useNavigate();
  const { code } = useParams();

  // auth check
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setModalTitle("Not Logged In");
      setModalMessage("You must be logged in to access this page.");
      setShowErrorModal(true);
    }
  }, [navigate]);

  // fetch collection
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        const col = data.find((c) => c.code === code);
        if (col) {
          setSelectedCollection(col);
        } else {
          navigate(
            fromPage === "collections" ? "/collections-bank" : "/questions?collection=all"
          );
        }
      } catch {
        navigate(
          fromPage === "collections" ? "/collections-bank" : "/questions?collection=all"
        );
      }
    };
    if (code) fetchCollections();
  }, [code, navigate]);

  // fetch questions
  useEffect(() => {
    if (!code || !selectedCollection) return;
    (async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/collections/${code}/questions`
        );
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : data.questions || []);
      } catch {
        setQuestions([]);
      }
    })();
  }, [code, selectedCollection]);

  // close any modal
  const handleModalClose = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
  };

  // EDIT COLLECTION
  const handleEditCollection = () => {
    setShowCollectionModal(true);
  };
  const handleCollectionUpdated = (updated) => {
    setSelectedCollection(updated);
    setShowCollectionModal(false);
    navigate(`/collections/${updated.code}`, { state: { from: fromPage } });
  };

  // DELETE COLLECTION
  const handleDeleteCollectionClick = () => {
    setModalTitle("Confirm Delete");
    setModalMessage(
      `Are you sure you want to delete "${selectedCollection.name}"? This will remove all its questions.`
    );
    setOnConfirmAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/collections/${selectedCollection._id}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setModalTitle("Deleted");
          setModalMessage("Collection deleted successfully!");
          setShowSuccessModal(true);
        } else {
          const data = await res.json();
          setModalTitle("Error");
          setModalMessage(data.message || "Failed to delete collection.");
          setShowErrorModal(true);
        }
      } catch {
        setModalTitle("Server Error");
        setModalMessage("Error deleting collection.");
        setShowErrorModal(true);
      }
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };
  const handleDeleteCollectionSuccess = () => {
    handleModalClose();
    navigate(fromPage === "collections" ? "/collections-bank" : "/questions?collection=all");
  };

  // DELETE QUESTION
  const handleDeleteQuestionClick = (q) => {
    setQuestionToDelete(q);
    setModalTitle("Confirm Delete");
    setModalMessage(`Delete Q${q.number}?`);
    setOnConfirmAction(() => async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/questions/${q.number}/${q.collectionId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setQuestions((prev) =>
            prev.filter((item) => item._id !== q._id)
          );
          setModalTitle("Deleted");
          setModalMessage("Question removed.");
          setShowSuccessModal(true);
        } else {
          const data = await res.json();
          setModalTitle("Error");
          setModalMessage(data.message || "Failed to delete question.");
          setShowErrorModal(true);
        }
      } catch {
        setModalTitle("Server Error");
        setModalMessage("Error deleting question.");
        setShowErrorModal(true);
      }
      setQuestionToDelete(null);
      setShowConfirmModal(false);
    });
    setShowConfirmModal(true);
  };

  return (
    <div className="login-container">
      <img
        src="/images/changihome.jpg"
        alt="Background"
        className="background-image"
      />
      <div className="page-overlay" />
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="CES" />
      </div>
      <div className="scroll-wrapper">
        <div className="buttons">
          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#000",
              marginTop: "100px",
            }}
          >
            Managing Collection: "{selectedCollection?.name || code}"
          </p>

          {selectedCollection && (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "10px",
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleEditCollection}
                style={{
                  backgroundColor: "#FFC107",
                  color: "#000",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Edit Collection
              </button>
              <button
                onClick={handleDeleteCollectionClick}
                style={{
                  backgroundColor: "#DC3545",
                  color: "#000",
                  padding: "4px 8px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
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
          )}

          <div
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              width: "100%",
              marginBottom: "16px",
            }}
          >
            {questions.length === 0 ? (
              <p>No questions found in this collection.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {questions.map((q, i) => (
                  <li
                    key={q._id}
                    onClick={() =>
                      navigate(`/edit-question/${q.number}/${q.collectionId}`)
                    }
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <strong>
                        {selectedCollection.questionOrder?.length > 0
                          ? `Game Q${i + 1}: (Original Q${q.number})`
                          : `Q${q.number}`}
                      </strong>
                    </div>
                    <p style={{ marginBottom: "8px" }}>{q.question}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{
                          backgroundColor: "#FFC107",
                          color: "#000",
                          padding: "5px 10px",
                          fontSize: "14px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/edit-question/${q.number}/${q.collectionId}`
                          );
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="login-btn"
                        style={{
                          background: "#DC3545",
                          color: "#fff",
                          padding: "5px 10px",
                          fontSize: "14px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuestionClick(q);
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

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <button
              onClick={() =>
                fromPage === "collections"
                  ? navigate("/collections")
                  : navigate("/questions?collection=all")
              }
              className="login-btn"
              style={{ backgroundColor: "#17C4C4", color: "#fff" }}
            >
              Return
            </button>
          </div>

          {showCollectionModal && (
            <EditCollectionModal
              collection={selectedCollection}
              onClose={() => setShowCollectionModal(false)}
              onCollectionUpdated={handleCollectionUpdated}
            />
          )}
        </div>
      </div>

      {/* Confirm */}
      <AlertModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={() => onConfirmAction()}
        title={modalTitle}
        message={modalMessage}
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
        showCancel={true}
      />

      {/* Success */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={
          modalTitle === "Deleted"
            ? handleDeleteCollectionSuccess
            : handleModalClose
        }
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />

      {/* Error */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="error"
        showCancel={false}
      />
    </div>
  );
};

export default EditCollection;
