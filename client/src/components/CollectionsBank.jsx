import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "./AlertModal";
import "./Questions.css";
import "./MainStyles.css";

const CollectionsBank = () => {
  const [collections, setCollections] = useState([]);

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const navigate = useNavigate();

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setModalTitle("Not Logged In");
      setModalMessage("You must be logged in to access this page.");
      setShowErrorModal(true);
    }
  }, [navigate]);

  // Fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  // Delete logic
  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/collections/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCollections((prev) => prev.filter((col) => col._id !== deleteTargetId));
        setModalTitle("Deleted");
        setModalMessage("Collection deleted successfully. Questions remain in the database.");
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        setModalTitle("Error");
        setModalMessage(data.message || "Failed to delete the collection.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      setModalTitle("Server Error");
      setModalMessage("Error deleting collection.");
      setShowErrorModal(true);
    }
    setShowConfirmModal(false);
    setDeleteTargetId(null);
  };

  // Handlers
  const handleEdit = (id) => {
    navigate(`/get-collections/${id}`, {
      state: { from: "collections" },
    });
  };

  const handleDeleteClick = (id, isPublic, name) => {
    if (isPublic) {
      setModalTitle("Cannot Delete Public Collection");
      setModalMessage(
        `The collection "${name}" is public. Please set its online status to offline in Edit Collection before deleting.`
      );
      setDeleteTargetId(id);
      setShowConfirmModal(true);
      return;
    }
    setDeleteTargetId(id);
    setModalTitle("Confirm Delete");
    setModalMessage(
      `Are you sure you want to delete "${name}"? Associated questions will remain in the database.`
    );
    setShowConfirmModal(true);
  };

  const handleModalClose = () => {
    setShowConfirmModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setDeleteTargetId(null);
    if (modalTitle === "Not Logged In") {
      navigate("/login");
    }
  };

  const handleConfirmAction = () => {
    if (modalTitle === "Cannot Delete Public Collection") {
      handleModalClose();
      navigate(`/collections/${deleteTargetId}`);
    } else {
      confirmDelete();
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay" />
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="scroll-wrapper">
        <div className="buttons" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 style={{ color: "#000", fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>
            Collections Bank
          </h1>

          <div style={{ maxHeight: "65vh", overflowY: "auto", width: "100%" }}>
            {collections.length === 0 ? (
              <p>No collections found.</p>
            ) : (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {collections.map((col) => (
                  <li
                    key={col._id}
                    onClick={() =>
                      navigate(`/get-collections/${col._id}`, {
                        state: { from: "collections" },
                    })}
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong>
                        {col.name}{" "}
                        {col.isPublic && (
                          <span
                            style={{
                              fontSize: "12px",
                              color: "#fff",
                              backgroundColor: "#28a745",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              marginLeft: "4px",
                            }}
                          >
                            Public
                          </span>
                        )}{" "}
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#fff",
                            backgroundColor: col.isOnline ? "#17C4C4" : "#DC3545",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            marginLeft: "4px",
                          }}
                        >
                          {col.isOnline ? "Online" : "Offline"}
                        </span>
                      </strong>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Code: {col.code}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      {col.questionOrder?.length || 0} Questions
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(col._id);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(col._id, col.isPublic, col.name);
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
            <button
              onClick={() => navigate("/add-collection")}
              className="login-btn"
              style={{ backgroundColor: "#28a745", color: "#000" }}
            >
              Add New Collection
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="login-btn"
              style={{ backgroundColor: "#17C4C4", color: "#000" }}
            >
              Return
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Delete */}
      <AlertModal
        isOpen={showConfirmModal}
        onClose={handleModalClose}
        onConfirm={handleConfirmAction}
        title={modalTitle}
        message={modalMessage}
        confirmText={modalTitle === "Cannot Delete Public Collection" ? "Edit Collection" : "Delete"}
        cancelText="Cancel"
        type="warning"
        showCancel={true}
      />

      {/* Success */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
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

export default CollectionsBank;
