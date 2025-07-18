import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./MainStyles.css";

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

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
    
    if (!collectionId) {
      alert("Missing collection ID.");
      navigate("/questions");
      return;
    }
    
    const fetchCollectionName = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        const target = data.find((col) => col._id === collectionId);
        if (target) setCollectionName(target.name || "");
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchQuestion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`);
        if (!res.ok) throw new Error("Question not found");
        const data = await res.json();
        setQuestion(data.data.question);
        setHint(data.data.hint);
        setExistingImage(data.data.image);
        // Fixed: Only set answer once, handle array properly
        setAnswer(Array.isArray(data.data.answer) ? data.data.answer.join(", ") : data.data.answer);
        setFunFact(data.data.funFact || "");
      } catch (err) {
        console.error("Error fetching question:", err);
        alert("Failed to load question.");
      }
    };

    fetchCollectionName();
    fetchQuestion();
  }, [number, collectionId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation first
    if (!question.trim()) {
      alert("Please enter a question description.");
      return;
    }

    if (!answer.trim()) {
      alert("Please enter an answer.");
      return;
    }

    const trimmedAnswers = answer.split(",").map(ans => ans.trim()).filter(ans => ans.length > 0);
    if (trimmedAnswers.length === 0) {
      alert("Please enter at least one valid answer.");
      return;
    }

    try {
      // ✅ Use FormData for image support
      const formData = new FormData();
      formData.append("question", question.trim());
      formData.append("hint", hint.trim());
      formData.append("answer", JSON.stringify(trimmedAnswers));
      formData.append("funFact", funFact.trim());
      formData.append("collectionId", collectionId);
      
      if (image) {
        formData.append("image", image);
      }
      
      if (deleteImage) {
        formData.append("deleteImage", "true");
      }

      const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`, {
        method: "PATCH",
        body: formData, // Only FormData - no Content-Type header!
      });

      if (res.ok) {
        alert("Question updated successfully!");
        navigate(`/questions`);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "Update failed"}`);
      }
    } catch (err) {
      console.error("Error updating question:", err);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate(`/questions`)}
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
        <h2 style={{ fontSize: "24px", color: "#000", textAlign: "center", marginBottom: "10px" }}>
          Edit {collectionName} Question #{number}
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          <textarea
            placeholder="Question Description"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
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
            placeholder="Hint"
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
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          {existingImage && !deleteImage && (
            <div style={{ marginBottom: "10px" }}>
              <img
                src={`http://localhost:5000/${existingImage}`}
                alt="Current question"
                style={{ 
                  width: "100%", 
                  maxHeight: "200px", 
                  objectFit: "contain", 
                  borderRadius: "10px" 
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
                  cursor: "pointer"
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
    </div>
  );
};

export default EditQuestion;