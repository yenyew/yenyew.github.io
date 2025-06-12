import React, { useState, useEffect } from "react";
import "/QuestionPage.css";


const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

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
  

  // Timer
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
  
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      alert(`Quiz complete! Final score: ${newScore}/${questions.length}`);
    }
  };
  

  if (questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="question-page">
      <div className="overlay">
        <div className="header">
          <div className="left-header">
          <img src="/images/ces.jpg" alt="Changi Experience Studio" className="ces-header" /><div className="team-box">Team 1</div>
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
