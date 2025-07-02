import React, { useState, useEffect, useRef } from "react";
import "./QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();

  const handleCameraClick = () => fileInputRef.current.click();

  const handleImageCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("http://172.20.10.2:5000/upload-photo", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) alert("Upload failed: " + result.error);
    } catch (err) {
      console.error("Upload error:", err);
      alert("An error occurred during upload.");
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://172.20.10.2:5000/questions");
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error("Failed to fetch questions:", error);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `00:${mins}:${secs}`;
  };

  const handleSubmit = () => {
    if (!userAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }
    if (!imagePreview) {
      alert("Please upload an image.");
      return;
    }

    const correctAnswer = questions[currentIndex].answer?.toLowerCase().trim() || "";
    const input = userAnswer.toLowerCase().trim();

    let newScore = score;
    if (input === correctAnswer) {
      newScore += 1;
      setScore(newScore);
      alert("Correct! +1 point");
    } else {
      alert(`Incorrect. The correct answer was: ${questions[currentIndex].answer}`);
    }

    setUserAnswer("");
    setImagePreview(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert(`Quiz complete! Final score: ${newScore}/${questions.length}`);
    }
  };

  if (questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="question-page">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="overlay">
        <div className="header">
          <div className="left-header">
            <img src="/images/ces.jpg" alt="Changi Experience Studio" className="ces-header" />
            <div className="team-box">Team 1</div>
          </div>
          <div className="right-header">
            <div className="score-box">Score: {score}</div>
            <div className="time-box">Time: {formatTime(elapsed)}</div>
          </div>
        </div>

        <div className="question-container">
          <div className="question-box">
            Q{currentIndex + 1}: {questions[currentIndex].question}
          </div>
          <div className="hint-box">{questions[currentIndex].hint}</div>
        </div>

        {/* ✅ Preview Image if exists */}
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Captured" className="image-preview" />
          </div>
        )}

        {/* ✅ Input field + Camera button stays ALWAYS */}
        <div className="answer-input">
          <input
            type="text"
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button className="camera-button" onClick={handleCameraClick}>📷</button>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleImageCapture}
          />
        </div>

        <button className="submit-button" onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default QuestionPage;
