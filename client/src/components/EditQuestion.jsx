import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AlertModal from "./AlertModal";
import "./MainStyles.css";
import "./Questions.css";

const EditQuestion = () => {
  const { number, collectionId } = useParams();
  const navigate = useNavigate();

  const [collectionName, setCollectionName] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [funFact, setFunFact] = useState("");
  const [type, setType] = useState("");
  const [options, setOptions] = useState("");

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [errorRedirect, setErrorRedirect] = useState(null);

  const handleModalClose = () => {
    setShowErrorModal(false);
    if (errorRedirect) navigate(errorRedirect);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate("/questions?collection=all");
  };

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setModalTitle("Not Logged In");
      setModalMessage("You must be logged in to access this page.");
      setErrorRedirect("/login");
      setShowErrorModal(true);
      return;
    }

    if (!collectionId) {
      setModalTitle("Missing Data");
      setModalMessage("Collection ID is missing.");
      setErrorRedirect("/questions?collection=all");
      setShowErrorModal(true);
      return;
    }

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        const target = data.find((c) => c._id === collectionId);
        if (target) setCollectionName(target.name);
      } catch {
        setModalTitle("Error");
        setModalMessage("Failed to load collection.");
        setErrorRedirect("/questions?collection=all");
        setShowErrorModal(true);
      }
    })();

    (async () => {
      try {
        const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`);
        if (!res.ok) throw new Error();
        const { data } = await res.json();
        setQuestion(data.question);
        setHint(data.hint);
        setExistingImage(data.image);
        setAnswer(Array.isArray(data.answer) ? data.answer.join(", ") : data.answer);
        setFunFact(data.funFact || "");
        setType(data.type || "");
        setOptions(Array.isArray(data.options) ? data.options.join(", ") : "");
      } catch {
        setModalTitle("Error");
        setModalMessage("Failed to load question.");
        setErrorRedirect("/questions?collection=all");
        setShowErrorModal(true);
      }
    })();
  }, [number, collectionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

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

    const trimmedAnswers = answer
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);

    if (trimmedAnswers.length === 0) {
      setModalTitle("Invalid Input");
      setModalMessage("Please enter at least one valid answer.");
      setShowErrorModal(true);
      return;
    }

    const formData = new FormData();
    formData.append("question", question.trim());
    formData.append("hint", hint.trim());
    formData.append("answer", JSON.stringify(trimmedAnswers));
    formData.append("funFact", funFact.trim());
    formData.append("collectionId", collectionId);
    formData.append("number", number); // ✅ required fix
    formData.append("type", type);

    if (type === "mcq") {
      const trimmedOptions = options
        .split(",")
        .map((opt) => opt.trim())
        .filter((opt) => opt);
      formData.append("options", JSON.stringify(trimmedOptions));
    }

    if (image) formData.append("image", image);
    if (deleteImage) formData.append("deleteImage", "true");

    try {
      const res = await fetch(
        `http://localhost:5000/questions/${number}/${collectionId}`,
        { method: "PATCH", body: formData }
      );
      if (res.ok) {
        setModalTitle("Success");
        setModalMessage("Question updated successfully!");
        setShowSuccessModal(true);
      } else {
        const data = await res.json();
        setModalTitle("Error");
        setModalMessage(data.message || "Update failed.");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Error updating question:", err);
      setModalTitle("Server Error");
      setModalMessage("Something went wrong.");
      setShowErrorModal(true);
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay" />
      <div className="header">
        <button
          onClick={() => navigate("/questions?collection=all")}
          className="login-btn"
          style={{ backgroundColor: "#17C4C4", color: "#fff", width: "120px", marginBottom: "10px" }}
        >
          &lt; Back
        </button>
      </div>
      <div className="buttons">
        <h2 style={{ fontSize: "24px", color: "#000", textAlign: "center", marginBottom: "10px" }}>
          Edit {collectionName} Q#{number}
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", height: "100px", borderRadius: "20px", backgroundColor: "white" }}
          />
          <input
            type="text"
            placeholder="Hint"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          {type === "mcq" && (
            <>
              <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
                Enter all answer options, separated by commas.
              </p>
              <input
                type="text"
                placeholder="MCQ Options (comma-separated)"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                className="login-btn"
                style={{ marginBottom: "10px", backgroundColor: "white" }}
              />
            </>
          )}

          <p style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}>
            Enter multiple answers, separated by commas.
          </p>
          <input
            type="text"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          {existingImage && !deleteImage && (
            <div style={{ marginBottom: "10px" }}>
              <img
                src={`http://localhost:5000/${existingImage}`}
                alt="Current"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "contain",
                  borderRadius: "10px",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setExistingImage(null);
                  setDeleteImage(true);
                }}
                style={{
                  marginTop: "5px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "5px 10px",
                  cursor: "pointer",
                }}
              >
                Delete Image
              </button>
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <input
            type="text"
            placeholder="Fun fact"
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
            Save
          </button>
        </form>
      </div>

      <AlertModal
        isOpen={showErrorModal}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="error"
        showCancel={false}
      />

      <AlertModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title={modalTitle}
        message={modalMessage}
        confirmText="OK"
        type="success"
        showCancel={false}
      />
    </div>
  );
};

export default EditQuestion;
