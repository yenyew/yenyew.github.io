// CreateCollection.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "./AlertModal";
import "./MainStyles.css";

const CreateCollection = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  // modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const handleModalClose = () => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });

      if (res.ok) {
        setModalTitle("Success");
        setModalMessage("Collection created successfully!");
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        setModalTitle("Error");
        setModalMessage(data.message || "Failed to create collection.");
        setShowErrorModal(true);
      }
    } catch {
      setModalTitle("Server Error");
      setModalMessage("Please try again later.");
      setShowErrorModal(true);
    }
  };

  const handleSuccessConfirm = () => {
    handleModalClose();
    navigate("/admin");
  };

  return (
    <div className="login-container">
      <img
        src="/images/changihome.jpg"
        alt="Background"
        className="background-image"
      />
      <div className="page-overlay" />
      <div className="header">
        <button
          onClick={() => navigate("/collections")}
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
          Create New Collection
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: "300px", width: "100%" }}
        >
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
            }}
          >
            Create
          </button>
        </form>
      </div>

      {/* Success */}
      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessConfirm}
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

export default CreateCollection;
