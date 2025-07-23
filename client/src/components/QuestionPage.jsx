import React, { useState, useEffect, useRef } from "react";
import "./QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const startTime = useRef(Date.now());
  const wrongAnswers = useRef(0);
  const questionsSkipped = useRef(0);
  const timePenalty = useRef(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      const collectionId = sessionStorage.getItem("collectionId");
      if (!collectionId) return;

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
      const now = Date.now();
      setElapsed(Math.floor((now - startTime.current) / 1000) + timePenalty.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `00:${mins}:${secs}`;
  };

  const handleHintClick = () => {
    if (questions[currentIndex]?.hint) {
      const confirmHint = window.confirm("Are you sure you want to use a hint? A 2-minute penalty will be added to your time.");
      if (!confirmHint) return;
      const hint = questions[currentIndex]?.hint;
      if (!hint) return;

      setHintsUsed((prev) => prev + 1);
      timePenalty.current += 120;
      alert(`Hint: ${hint}`);
    }
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion) return;

    if (!userAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    const confirmed = window.confirm("Submit answer? Wrong answers add 5-minute penalty.");
    if (!confirmed) return;

    const input = userAnswer.toLowerCase().trim();
    const acceptableAnswers = Array.isArray(currentQuestion.answer)
      ? currentQuestion.answer
      : [currentQuestion.answer];

    const isCorrect = acceptableAnswers.some(
      (ans) => ans.toLowerCase().trim() === input
    );

    const isLast = currentIndex === questions.length - 1;

    if (isCorrect) {
      alert("Correct!");
      setCorrectAnswers((prev) => prev + 1);
      setUserAnswer("");

      const funFact = questions[currentIndex].funFact || "No fun fact available.";
      alert(`🎉 Fun Fact: ${funFact}`);

      if (isLast) {
        setTimeout(() => handleFinish(true), 100);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } else {
      alert("Incorrect.");
      wrongAnswers.current += 1;
      alert("Incorrect. Try again!");
      timePenalty.current += 300;
      setUserAnswer("");

      if (isLast) {
        setTimeout(() => handleFinish(false), 100);
      }
    }
  };

  const handleSkip = () => {
    const confirmed = window.confirm("Skip this question? A 10-minute penalty will be added.");
    if (!confirmed) return;

    timePenalty.current += 600;
    setUserAnswer("");
    questionsSkipped.current += 1;

    const isLast = currentIndex === questions.length - 1;
    const funFact = questions[currentIndex].funFact || "No fun fact available.";
    alert(`🎉 Fun Fact: ${funFact}`);

    if (isLast) {
      handleFinish(false);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async (answeredLast) => {
    const finalCorrect = correctAnswers + (answeredLast ? 1 : 0);
    const rawTime = Math.floor((Date.now() - startTime.current) / 1000);
    const finalTime = rawTime + wrongAnswers.current * 300 + timePenalty.current;

    alert("Quiz complete!");

    const playerId = sessionStorage.getItem("playerId");
    const collectionId = sessionStorage.getItem("collectionId");

    try {
      await fetch(`http://localhost:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalCorrect,
          totalTimeInSeconds: finalTime,
          hintsUsed,
          finishedAt: new Date(),
          collectionId,
          wrongAnswers: wrongAnswers.current,
          questionsSkipped: questionsSkipped.current,
        }),
      });
    } catch (error) {
      console.error("Failed to submit results:", error);
    }

    window.location.href = "/results";
  };

  const currentQuestion = questions[currentIndex];
  if (questions.length === 0) return <div>Loading questions...</div>;
  if (!currentQuestion) return <div>Loading question...</div>;

  return (
    <div className="question-page">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay">
        <div className="centered-content">
          <div className="left-header">
            <img src="/images/ces.jpg" alt="Changi Experience Studio" className="ces-header" />
          </div>
          <div className="right-header">
            <div className="time-box">Time: {formatTime(elapsed)}</div>
          </div>
        </div>

        <div className="question-container">
          <div className="question-box">
            <strong>
              Question {currentIndex + 1} of {questions.length}:
            </strong>{" "}
            {currentQuestion.question}
          </div>

          {questions[currentIndex].image && (
            <img
              src={`http://localhost:5000/${questions[currentIndex].image}`}
              alt={`Question ${currentIndex + 1}`}
              style={{
                maxWidth: "90%",
                maxHeight: "300px",
                marginTop: "10px",
                borderRadius: "12px",
              }}
            />
          )}
        </div>

        <div className="hint-box">
          <button onClick={handleHintClick}>💡 Show Hint</button>
        </div>

        <div className="answer-input">
          <input
            type="text"
            placeholder="Type your answer here..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>

        <div className="button-container">
          <button className="submit-button" onClick={handleSkip}>
            Skip Question
          </button>
          <button className="submit-button" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
