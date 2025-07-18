import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

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
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }
    
    const fetchCollections = async () => {
      try {
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
      } catch (err) {
        console.error("Failed to fetch collections:", err);
      }
    };

    fetchCollections();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // ✅ Add validation at the TOP
    if (!number || number.trim() === "") {
      alert("Please enter a question number.");
      return;
    }

    if (!collectionId || collectionId.trim() === "") {
      alert("Please select a collection.");
      return;
    }

    if (!question || question.trim() === "") {
      alert("Please enter a question description.");
      return;
    }

    if (!answer || answer.trim() === "") {
      alert("Please enter an answer.");
      return;
    }

    const questionNumber = parseInt(number);
    if (isNaN(questionNumber) || questionNumber <= 0) {
      alert("Please enter a valid positive question number.");
      return;
    }

    const trimmedAnswers = answer.split(",").map(ans => ans.trim()).filter(ans => ans.length > 0);
    if (trimmedAnswers.length === 0) {
      alert("Please enter at least one valid answer.");
      return;
    }

    try {
      // Check for duplicates
      const allRes = await fetch("http://localhost:5000/questions");
      const allQuestions = await allRes.json();

      const exists = allQuestions.some(
        (q) => q.number === parseInt(number) && q.collectionId === collectionId
      );

      if (exists) {
        alert("A question with that number already exists in the selected collection.");
        return;
      }

      // ✅ Use FormData for image upload (ONLY ONCE!)
      const formData = new FormData();
      formData.append("number", questionNumber);
      formData.append("collectionId", collectionId);
      formData.append("question", question.trim());
      formData.append("hint", hint.trim());
      formData.append("answer", JSON.stringify(trimmedAnswers));
      formData.append("funFact", funFact.trim());
      
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost:5000/questions", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("Question added successfully!");
        // Clear form
        setNumber("");
        setCollectionId("");
        setQuestion("");
        setHint("");
        setAnswer("");
        setFunFact("");
        setImage(null);
        setMessage("");
      } else {
        const data = await response.json();
        setMessage(`Error: ${data.message || "Could not add question."}`);
      }
    } catch (err) {
      console.error("Error submitting question:", err);
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="header">
        <button
          onClick={() => navigate("/questions")}
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
          Create a New Question:
        </h2>

        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          <input
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="Question Number"
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />

          <select
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
            required
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
              outline: "none",
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
            required
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
    </div>
  );
};

export default CreateQuestion;