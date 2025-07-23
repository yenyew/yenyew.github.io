import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import "./LoginScreen.css";

const EditQuestion = () => {
  const { number } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [collectionId, setCollectionId] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [question, setQuestion] = useState("");
  const [hint, setHint] = useState("");
  const [answer, setAnswer] = useState("");
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [deleteImage, setDeleteImage] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const colId = params.get("collectionId");

    if (!colId) {
      alert("Missing collection ID.");
      navigate("/admin");
      return;
    }

    setCollectionId(colId);

    const fetchCollectionName = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        const target = data.find((col) => col._id === colId);
        if (target) setCollectionName(target.name || "");
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };

    const fetchQuestion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/questions/${number}/${colId}`);
        if (!res.ok) throw new Error("Question not found");
        const data = await res.json();
        setQuestion(data.data.question);
        setHint(data.data.hint);
        setAnswer(data.data.answer);
        setExistingImage(data.data.image);
      } catch (err) {
        console.error("Error fetching question:", err);
        alert("Failed to load question.");
      }
    };

    fetchCollectionName();
    fetchQuestion();
  }, [number, location.search, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("question", question);
      formData.append("hint", hint);
      formData.append("answer", answer);
      formData.append("collectionId", collectionId);
      if (image) formData.append("image", image);
      if (deleteImage) formData.append("deleteImage", "true");

      const res = await fetch(`http://localhost:5000/questions/${number}/${collectionId}`, {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        alert("Question updated successfully!");
        navigate(`/edit-collection/${collectionId}`);
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
      <div className="overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate(`/edit-collection/${collectionId}`)}
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
                style={{ width: "100%", maxHeight: "200px", objectFit: "contain", borderRadius: "10px" }}
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
                  padding: "5px 10px"
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
