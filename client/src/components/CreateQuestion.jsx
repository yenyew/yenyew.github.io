// CreateQuestion.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "./AlertModal";
import "./MainStyles.css";
import "./Questions.css";

const CreateQuestion = () => {
  const [number, setNumber] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [funFact, setFunFact] = useState("");
  const [message, setMessage] = useState("");
  const [collections, setCollections] = useState([]);
  const [image, setImage] = useState(null);

  // modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  // auth + fetch collections
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setModalTitle("Not Logged In");
      setModalMessage("You must be logged in to access this page.");
      setShowErrorModal(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(data);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    })();
  }, [navigate]);

  const handleModalClose = () => {
    setShowErrorModal(false);
    setShowSuccessModal(false);
    if (modalTitle === "Not Logged In") {
      navigate("/login");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // validations
    if (!number.trim()) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter a question number.");
      setShowErrorModal(true);
      return;
    }
    if (!collectionId) {
      setModalTitle("Invalid Input");
      setModalMessage("Please select a collection.");
      setShowErrorModal(true);
      return;
    }
    if (!question.trim()) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter a question description.");
      setShowErrorModal(true);
      return;
    }
    if (!answer.trim()) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter at least one answer.");
      setShowErrorModal(true);
      return;
    }

    const qNum = parseInt(number, 10);
    if (isNaN(qNum) || qNum <= 0) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter a valid positive question number.");
      setShowErrorModal(true);
      return;
    }

    // check duplicate
    try {
      const allRes = await fetch("http://localhost:5000/questions");
      const allQs = await allRes.json();
      if (
        allQs.some((q) => q.number === qNum && q.collectionId === collectionId)
      ) {
        setModalTitle("Duplicate");
        setModalMessage(
          "A question with that number already exists in the selected collection."
        );
        setShowErrorModal(true);
        return;
      }
    } catch {
      // ignore
    }

    // prepare payload
    const answersArr = answer
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);
    const formData = new FormData();
    formData.append("number", qNum);
    formData.append("collectionId", collectionId);
    formData.append("question", question.trim());
    formData.append("hint", hint.trim());
    formData.append("answer", JSON.stringify(answersArr));
    formData.append("funFact", funFact.trim());
    if (image) formData.append("image", image);

    // submit
    try {
      const res = await fetch("http://localhost:5000/questions", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setModalTitle("Success");
        setModalMessage("Question added successfully!");
        setShowSuccessModal(true);
        // clear
        setNumber("");
        setCollectionId("");
        setQuestion("");
        setHint("");
        setAnswer("");
        setFunFact("");
        setImage(null);
      } else {
        const data = await res.json();
        setMessage(data.message || "Could not add question.");
      }
    } catch {
      setMessage("Server error. Please try again.");
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate("/questions?collection=all");
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
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>
      <div className="header">
        <button
          onClick={() => navigate("/questions?collection=all")}
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
        <h2
          style={{
            fontSize: "24px",
            color: "#000",
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          Create a New Question:
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", maxWidth: "300px" }}
        >
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Question Number"
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            className="dropdown-select"
            style={{
              marginBottom: "10px",
              height: "50px",
              borderRadius: "20px",
              backgroundColor: "white",
              color: "#000",
              fontSize: "16px",
              padding: "0 10px",
              width: "100%",
            }}
          >
            <option value="">Select Collection</option>
            {collections.map((col) => (
              <option key={col._id} value={col._id}>
                {col.name}
              </option>
            ))}
          </select>

          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="login-btn"
            style={{
              marginBottom: "10px",
              height: "100px",
              borderRadius: "20px",
              backgroundColor: "white",
            }}
          />

          <input
            type="text"
            placeholder="Hint (Optional)"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
            Enter multiple acceptable answers, separated by commas.
          </p>
          <input
            type="text"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <input
            type="text"
            placeholder="Fun Fact (Optional)"
            value={funFact}
            onChange={(e) => setFunFact(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <button
            type="submit"
            className="login-btn"
            style={{
              background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
              color: "black",
              width: "120px",
              marginTop: "10px",
            }}
          >
            Add
          </button>
        </form>

        {message && (
          <div style={{ color: "red", marginTop: "10px" }}>{message}</div>
        )}
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

export default CreateQuestion;
