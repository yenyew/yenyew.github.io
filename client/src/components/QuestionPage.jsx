import React, { useState, useEffect, useRef } from "react";
import "/QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  const wrongAnswers = useRef(0); // Used to calculate penalty time

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

  const handleHintClick = () => {
    setHintsUsed((prev) => prev + 1);
    alert(`Hint: ${questions[currentIndex].hint}`);
  };

  const handleSubmit = async () => {
    const correctAnswer = questions[currentIndex].answer?.toLowerCase().trim() || "";
    const input = userAnswer.toLowerCase().trim();
    const isCorrect = input === correctAnswer;

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      alert("Correct!");
    } else {
      wrongAnswers.current += 1;
      alert(`Incorrect. The correct answer was: ${questions[currentIndex].answer}`);
    }

    setUserAnswer("");

    const isLast = currentIndex === questions.length - 1;

    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Final calculations
    const finalCorrect = correctAnswers + (isCorrect ? 1 : 0);
    const finalScore = finalCorrect * 500;
    const rawTime = Math.floor((Date.now() - startTime) / 1000);
    const finalWrongCount = wrongAnswers.current + (!isCorrect ? 1 : 0);
    const finalTime = rawTime + finalWrongCount * 300; // 5 mins per wrong answer
    const finalHintsUsed = hintsUsed;

    alert(`Quiz complete! Final score: ${finalScore}`);

    const playerId = sessionStorage.getItem("playerId");
    if (playerId) {
      await fetch(`http://172.20.10.2:5000/players/${playerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: finalScore,
          totalTimeInSeconds: finalTime,
          hintsUsed: finalHintsUsed,
          finishedAt: new Date(),
        }),
      });
    }

    window.location.href = "/share";
  };

  if (questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="question-page">
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
          <button className="camera-button">📷</button>
        </div>

        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default QuestionPage;
