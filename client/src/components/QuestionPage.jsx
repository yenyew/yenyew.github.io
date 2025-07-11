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
  const questionsSkipped = useRef(0);
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

  const confirmSubmit = window.confirm(
    "Are you sure you want to submit? Wrong answers will incur a 5-minute penalty."
  );
  if (!confirmSubmit) return;

  const input = userAnswer.toLowerCase().trim();
  let acceptableAnswers = questions[currentIndex].answer;
  if (!Array.isArray(acceptableAnswers)) {
    acceptableAnswers = [acceptableAnswers];
  }

  const isCorrect = acceptableAnswers.some(
    (ans) => ans.toLowerCase().trim() === input
  );

  const isLast = currentIndex === questions.length - 1;

  if (isCorrect) {
    alert("Correct!");
    setCorrectAnswers((prev) => prev + 1);
    setUserAnswer("");

    if (isLast) {
      setTimeout(() => handleFinish(true), 100); // Show alert first, then finish
    } else {
      setCurrentIndex((prev) => prev + 1);
    }

  } else {
    alert("Incorrect."); // no answer suggestions shown
    wrongAnswers.current += 1;
    timePenalty.current += 300; // Add 5-minute penalty
    setUserAnswer("");

    if (isLast) {
      setTimeout(() => handleFinish(false), 100);
    }
  }
};



  const handleSkip = () => {
    const confirmSkip = window.confirm("Are you sure you want to skip this question? A 10-minute penalty will be added.");
    if (!confirmSkip) return;

    timePenalty.current += 600; // Add 10 minutes
    questionsSkipped.current += 1;
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
    const finalScore = finalCorrect;
    const rawTime = Math.floor((Date.now() - startTime) / 1000);
    const finalWrongCount = wrongAnswers.current;
    const finalTime = rawTime + finalWrongCount * 300 + timePenalty.current;
    const finalHintsUsed = hintsUsed;

    alert("Quiz complete!");
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
          wrongAnswers: finalWrongCount,
          questionsSkipped: questionsSkipped.current
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
            {/* <div className="team-box">Team 1</div> */}
          </div>
          <div className="right-header">
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
