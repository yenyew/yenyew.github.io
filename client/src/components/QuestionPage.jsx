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
  const wrongAnswers = useRef(0);
  const timePenalty = useRef(0); 

  useEffect(() => {
    const fetchQuestions = async () => {
      const collectionId = sessionStorage.getItem("collectionId");
      if (!collectionId) {
        console.error("No collectionId found in sessionStorage");
        return;
      }

      try {
        const res = await fetch(`http://172.20.10.2:5000/questions?collectionId=${collectionId}`);
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
      setElapsed(Math.floor((Date.now() - startTime) / 1000) + timePenalty.current);
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
      const confirmHint = window.confirm("Are you sure you want to use a hint? A 2-minute penalty will be added to your time.");
    if (!confirmHint) return;

      setHintsUsed((prev) => prev + 1);
      timePenalty.current += 120;
      alert(`Hint: ${questions[currentIndex].hint}`);
    }
  };

  const handleSubmit = () => {
    if (!questions[currentIndex]) return;

    if (!userAnswer.trim()) {
      alert("Please enter your answer.");
      return;
    }

    const correctAnswer = questions[currentIndex].answer?.toLowerCase().trim() || "";
    const input = userAnswer.toLowerCase().trim();
    const isCorrect = input === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setUserAnswer("");
      const isLast = currentIndex === questions.length - 1;

      if (isLast) {
        handleFinish(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }

      alert("Correct!");
    } else {
      wrongAnswers.current += 1;
      alert(`Incorrect. Try again!`);
    }
  };

  const handleSkip = () => {
    const confirmSkip = window.confirm("Are you sure you want to skip this question? A 10-minute penalty will be added.");
    if (!confirmSkip) return;

    timePenalty.current += 600; // Add 10 minutes
    setUserAnswer("");

    const isLast = currentIndex === questions.length - 1;

    if (isLast) {
      handleFinish(false); // skipped final question
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleFinish = async (answeredLast) => {
    const finalCorrect = correctAnswers + (answeredLast ? 1 : 0);
    const finalScore = finalCorrect * 500;
    const rawTime = Math.floor((Date.now() - startTime) / 1000);
    const finalWrongCount = wrongAnswers.current;
    const finalTime = rawTime + finalWrongCount * 300 + timePenalty.current;
    const finalHintsUsed = hintsUsed;

    alert(`Quiz complete! Final score: ${finalScore}`);

    const playerId = sessionStorage.getItem("playerId");
    const collectionId = sessionStorage.getItem("collectionId");

    if (playerId) {
      await fetch(`http://172.20.10.2:5000/players/${playerId}`, {
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

    window.location.href = "/results";
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
          <button className="submit-button" onClick={handleSkip}>Skip Question</button>
          <button className="submit-button" onClick={handleSubmit}>Submit</button>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;
