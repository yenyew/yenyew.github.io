// EditCollectionModal.jsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import AlertModal from "./AlertModal";

const generateRandomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const EditCollectionModal = ({ collection, onClose, onCollectionUpdated }) => {
  const [collectionName, setCollectionName] = useState(collection.name);
  const [collectionCodeInput, setCollectionCodeInput] = useState(collection.code);

  // Modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [latestUpdatedCollection, setLatestUpdatedCollection] = useState(null);

  const handleModalClose = () => {
    setShowErrorModal(false);
    setShowSuccessModal(false);
  };

  const handleSuccessConfirm = () => {
    handleModalClose();
    if (latestUpdatedCollection) {
      onCollectionUpdated(latestUpdatedCollection);
    }
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    // Validation
    if (!collectionName.trim()) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter a collection name.");
      setShowErrorModal(true);
      return;
    }
    if (!collectionCodeInput.trim()) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter a collection code.");
      setShowErrorModal(true);
      return;
    }

    // Submit patch
    try {
      const res = await fetch(
        `http://localhost:5000/collections/${collection._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: collectionName.trim(),
            code: collectionCodeInput.trim(),
          }),
        }
      );

      if (res.ok) {
        const updated = await res.json();
        setLatestUpdatedCollection(updated);
        setModalTitle("Success");
        setModalMessage("Collection updated successfully!");
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        setModalTitle("Error");
        setModalMessage(data.message || "Failed to update collection.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error updating collection:", err);
      setModalTitle("Server Error");
      setModalMessage("Error updating collection. Please try again.");
      setShowErrorModal(true);
    }
  };

  const handleGenerateCode = () => {
    setCollectionCodeInput(generateRandomCode());
  };

  return createPortal(
    <>
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
        onClick={onClose}
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "400px",
            boxSizing: "border-box",
            color: "#000",
          }}
        >
          <h3 style={{ marginBottom: "20px", textAlign: "center", color: "#000" }}>
            Edit Collection
          </h3>
          <form onSubmit={handleSaveCollection}>
            <input
              type="text"
              placeholder="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
                color: "#000",
                backgroundColor: "#fff",
              }}
            />
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                <input
                  type="text"
                  placeholder="Collection Code"
                  value={collectionCodeInput}
                  onChange={(e) => setCollectionCodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                    boxSizing: "border-box",
                    color: "#000",
                    backgroundColor: "#fff",
                  }}
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "#17C4C4",
                    width: "100px",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Generate
                </button>
              </div>
              <p style={{ fontSize: "11px", color: "#666", margin: "0", textAlign: "center" }}>
                Tip: Generate a random 6-character code or enter your own
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Error Modal */}
      <AlertModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="error"
        showCancel={false}
      />

      {/* Success Modal */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />
    </>,
    document.body
  );
};

export default EditCollectionModal;
