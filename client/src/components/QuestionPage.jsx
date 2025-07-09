import React, { useState, useEffect, useRef } from "react";
import "./QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();
  const wrongAnswers = useRef(0);

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
      const response = await fetch("http://localhost:5000/upload-photo", {
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
      const collectionId = sessionStorage.getItem("collectionId");
      if (!collectionId) {
        console.error("No collectionId found in sessionStorage");
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/questions?collectionId=${collectionId}`);
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

  const handleHintClick = () => {
    if (questions[currentIndex]?.hint) {
      setHintsUsed((prev) => prev + 1);
      alert(`Hint: ${questions[currentIndex].hint}`);
    }
  };

  const handleSubmit = async () => {
    if (!questions[currentIndex]) return;

    if (!userAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    const input = userAnswer.toLowerCase().trim();

    let acceptableAnswers = questions[currentIndex].answer;
    if (!Array.isArray(acceptableAnswers)) {
      acceptableAnswers = [acceptableAnswers];
    }

    const isCorrect = acceptableAnswers.some(ans => ans.toLowerCase().trim() === input);

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      alert("Correct!");
    } else {
      wrongAnswers.current += 1;
      const answerDisplay = acceptableAnswers.join(" or ");
      alert(`Incorrect. Accepted answers: ${answerDisplay}`);
    }

    setUserAnswer("");
    setImagePreview(null);

    const isLast = currentIndex === questions.length - 1;

    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const finalScore = finalCorrect * 500;
    const rawTime = Math.floor((Date.now() - startTime) / 1000);
    const finalWrongCount = wrongAnswers.current + (!isCorrect ? 1 : 0);
    const finalTime = rawTime + finalWrongCount * 300;
    const finalHintsUsed = hintsUsed;

    alert(`Quiz complete! Final score: ${finalScore}`);

    const playerId = sessionStorage.getItem("playerId");
    const collectionId = sessionStorage.getItem("collectionId");

    if (playerId) {
      await fetch(`http://localhost:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalScore,
          totalTimeInSeconds: finalTime,
          hintsUsed: finalHintsUsed,
          finishedAt: new Date(),
          collectionId,
        }),
      });
    }

    window.location.href = "/share";
  };

  if (questions.length === 0) return <div>Loading questions...</div>;
  if (!questions[currentIndex]) return <div>Loading question...</div>;

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
            <div className="score-box">Score: {correctAnswers * 500}</div>
            <div className="time-box">Time: {formatTime(elapsed)}</div>
          </div>
        </div>

        <div className="question-container">
          <div className="question-box">
            Q{currentIndex + 1}: {questions[currentIndex].question}
          </div>
        </div>

        <div className="hint-box">
          <button onClick={handleHintClick}>💡 Show Hint</button>
        </div>

        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Captured" className="image-preview" />
          </div>
        )}

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
