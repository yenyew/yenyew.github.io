import React, { useState, useEffect, useRef } from "react";
import "./QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameSettings, setGameSettings] = useState(null);

  const startTime = useRef(Date.now());
  const wrongAnswers = useRef(0);
  const questionsSkipped = useRef(0);
  const timePenalty = useRef(0);

  useEffect(() => {
    const fetchQuestionsAndSettings = async () => {
      const collectionId = sessionStorage.getItem("collectionId");
      if (!collectionId) return;

      try {
        // Fetch effective settings for this collection
        const settingsResponse = await fetch(`http://localhost:5000/collections/${collectionId}/effective-settings`);
        const settingsData = await settingsResponse.json();
        setGameSettings(settingsData);

        // Fetch questions (existing logic)
        const collections = await fetch("http://localhost:5000/collections/");
        const collectionsData = await collections.json();
        const collection = collectionsData.find(c => c._id === collectionId);
        
        if (collection && collection.questionOrder && collection.questionOrder.length > 0) {
          const response = await fetch(`http://localhost:5000/collections/${collection.code}/questions`);
          const data = await response.json();
          setQuestions(Array.isArray(data) ? data : data.questions || []);
        } else {
          const res = await fetch(`http://localhost:5000/questions?collectionId=${collectionId}`);
          const data = await res.json();
          setQuestions(data);
        }
      } catch (error) {
        console.error("Failed to fetch questions and settings:", error);
      }
    };

    fetchQuestionsAndSettings();
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

  const formatPenaltyTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return secs > 0 ? `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs > 1 ? 's' : ''}` : `${mins} minute${mins > 1 ? 's' : ''}`;
    }
    return `${secs} second${secs > 1 ? 's' : ''}`;
  };


  const handleHintClick = () => {
    const hint = questions[currentIndex]?.hint;
    if (!hint || !gameSettings) return;

    const penaltyText = formatPenaltyTime(gameSettings.hintPenalty);
    const confirmed = window.confirm(`Use a hint? A ${penaltyText} penalty will be added.`);
    if (confirmed) {
      setHintsUsed((prev) => prev + 1);
      timePenalty.current += gameSettings.hintPenalty;
      alert(`Hint: ${hint}`);
    }
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion || !gameSettings) return;

    if (!userAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    const penaltyText = formatPenaltyTime(gameSettings.wrongAnswerPenalty);
    const confirmed = window.confirm(`Submit answer? Wrong answers add ${penaltyText} penalty.`);
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
      timePenalty.current += gameSettings.wrongAnswerPenalty;
      setUserAnswer("");

      if (isLast) {
        setTimeout(() => handleFinish(false), 100);
      }
    }
  };

  const handleSkip = () => {
    if (!gameSettings) return;
    
    const penaltyText = formatPenaltyTime(gameSettings.skipPenalty);
    const confirmed = window.confirm(`Skip this question? A ${penaltyText} penalty will be added.`);
    if (!confirmed) return;

    timePenalty.current += gameSettings.skipPenalty;
    questionsSkipped.current += 1;
    setUserAnswer("");

    const funFact = questions[currentIndex].funFact || "No fun fact available.";
    alert(`🎉 Fun Fact: ${funFact}`);

    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      handleFinish(false);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async (answeredLast) => {
    const finalCorrect = correctAnswers + (answeredLast ? 1 : 0);
    const rawTime = Math.floor((Date.now() - startTime.current) / 1000);
    const finalTime = rawTime + timePenalty.current;

    alert("Quiz complete!");

    const playerId = sessionStorage.getItem("playerId");
    const collectionId = sessionStorage.getItem("collectionId");

    if (playerId) {
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
            questionsSkipped: questionsSkipped.current
          }),
        });
      } catch (error) {
        console.error("Failed to submit results:", error);
      }
    }

    window.location.href = "/results";
  };

  const currentQuestion = questions[currentIndex];
  if (questions.length === 0 || !gameSettings) return <div>Loading questions...</div>;
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