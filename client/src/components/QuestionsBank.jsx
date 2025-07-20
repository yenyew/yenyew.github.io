// QuestionsBank.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertModal from "./AlertModal";
import "./Questions.css";
import "./MainStyles.css";

const QuestionsBank = () => {
  const [questions, setQuestions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionCode, setCollectionCode] = useState("");
  
  // Modal state
  const [showError, setShowError] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  
  // remember which question to delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const passedCode = new URLSearchParams(location.search).get("collection");

  // Auth check
  useEffect(() => {
    if (!localStorage.getItem("jwtToken")) {
      setModalTitle("Not Logged In");
      setModalMessage("You must be logged in to access this page.");
      setShowError(true);
    }
  }, []);

  // Fetch collections
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(data);
        if (data.length && !collectionCode) {
          setCollectionCode(passedCode || "all");
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [passedCode, collectionCode]);

  // Fetch questions whenever collectionCode changes
  useEffect(() => {
    if (!collectionCode) return;
    const url =
      collectionCode === "all"
        ? "http://localhost:5000/questions"
        : `http://localhost:5000/collections/${collectionCode}/questions`;
    (async () => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : data.questions || []);
      } catch (err) {
        console.error(err);
        setQuestions([]);
      }
    })();
  }, [collectionCode]);

  const getCollectionName = (id) => {
    const col = collections.find((c) => c._id === id);
    return col ? col.name : "Unknown Collection";
  };

  // Edit handler unchanged
  const handleEdit = (number, colId) => {
    if (collectionCode === "all" && !colId) {
      setModalTitle("Error");
      setModalMessage("Cannot edit: Question collection ID not found.");
      setShowError(true);
      return;
    }
    const targetId =
      collectionCode === "all"
        ? colId
        : collections.find((c) => c.code === collectionCode)?._id;
    if (!targetId) {
      setModalTitle("Error");
      setModalMessage("Collection not selected.");
      setShowError(true);
      return;
    }
    navigate(`/edit-question/${number}/${targetId}`);
  };

  // Schedule delete-confirm
  const handleDeleteClick = (q) => {
    setDeleteTarget(q);
    setModalTitle("Confirm Delete");
    setModalMessage("Are you sure you want to delete this question?");
    setShowConfirmDelete(true);
  };

  // Actually delete
  const confirmDelete = async () => {
    const { number, collectionId } = deleteTarget || {};
    if (!collectionId) {
      setModalTitle("Error");
      setModalMessage("Collection ID not found for this question.");
      setShowError(true);
    } else {
      try {
        const res = await fetch(
          `http://localhost:5000/questions/${number}/${collectionId}`,
          { method: "DELETE" }
        );
        if (res.ok) {
          setQuestions((prev) =>
            prev.filter((q) => !(q.number === number && q.collectionId === collectionId))
          );
          setModalTitle("Deleted");
          setModalMessage("Question deleted.");
          setShowDeleteSuccess(true);
        } else {
          const data = await res.json();
          setModalTitle("Error");
          setModalMessage(data.message || "Failed to delete question.");
          setShowError(true);
        }
      } catch (err) {
        console.error(err);
        setModalTitle("Error");
        setModalMessage("Error deleting question.");
        setShowError(true);
      }
    }
    setShowConfirmDelete(false);
    setDeleteTarget(null);
  };

  // Close any modal
  const closeModal = () => {
    setShowError(false);
    setShowConfirmDelete(false);
    setShowDeleteSuccess(false);
    // redirect if not logged in
    if (modalTitle === "Not Logged In") {
      navigate("/login");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="BG" className="background-image" />
      <div className="page-overlay" />
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Logo" />
      </div>
      <div className="scroll-wrapper">
        <div className="buttons" style={{ gap: "12px" }}>
          {/* Collection selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <select
              value={collectionCode}
              onChange={(e) => {
                const val = e.target.value;
                navigate(
                  val === "all"
                    ? "/questions?collection=all"
                    : `/collections/${val}?collection=${val}`
                );
              }}
              style={{ padding: "6px", fontSize: "15px" }}
            >
              <option value="all">All Questions</option>
              {collections.map((c) => (
                <option key={c._id} value={c.code}>
                  {c.name} Collection
                </option>
              ))}
            </select>
            <p style={{ fontSize: "16px", fontWeight: "bold", margin: 0 }}>
              Viewing "{collectionCode === "all"
                ? "All Collections"
                : collections.find((c) => c.code === collectionCode)?.name ||
                  collectionCode}"
            </p>
          </div>

          {/* Question list */}
          <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
            {questions.length === 0 ? (
              <p>No questions found.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {questions.map((q, idx) => (
                  <li
                    key={q._id}
                    onClick={() => handleEdit(q.number, q.collectionId)}
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <strong>
                        {collectionCode !== "all" &&
                        collections.find((c) => c.code === collectionCode)
                          ?.questionOrder?.length > 0
                          ? `Game Q${idx + 1}: (Original Q${q.number})`
                          : `Q${q.number}`}
                      </strong>
                      {collectionCode === "all" && (
                        <span style={{
                          fontSize: "12px",
                          color: "#666",
                          background: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}>
                          {getCollectionName(q.collectionId)}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "8px 0" }}>{q.question}</p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{
                          backgroundColor: "#FFC107",
                          color: "#000",
                          padding: "5px 10px",
                          fontSize: "14px"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(q.number, q.collectionId);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="login-btn"
                        style={{
                          backgroundColor: "#DC3545",
                          color: "#fff",
                          padding: "5px 10px",
                          fontSize: "14px"
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(q);
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

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => navigate("/add-question")}
              className="login-btn"
            >
              Add New Question
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="login-btn"
              style={{ backgroundColor: "#17C4C4" }}
            >
              Return
            </button>
          </div>
        </div>
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={showError}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type={modalTitle === "Not Logged In" ? "error" : "info"}
        showCancel={false}
      />

      {/* Delete Confirmation */}
      <AlertModal
        isOpen={showConfirmDelete}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title={modalTitle}
        message={modalMessage}
        confirmText="Delete"
        cancelText="Cancel"
        type="warning"
        showCancel={true}
      />

      {/* Delete Success */}
      <AlertModal
        isOpen={showDeleteSuccess}
        onClose={closeModal}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />
    </div>
  );
};

export default QuestionsBank;
