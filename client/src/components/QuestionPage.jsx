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
        
        let fetchedQuestions = [];
        
        if (collection && collection.questionOrder && collection.questionOrder.length > 0) {
          const response = await fetch(`http://localhost:5000/collections/${collection.code}/questions`);
          const data = await response.json();
          fetchedQuestions = Array.isArray(data) ? data : data.questions || [];
        } else {
          const res = await fetch(`http://localhost:5000/questions?collectionId=${collectionId}`);
          const data = await res.json();
          fetchedQuestions = data;
        }

        // Apply game mode randomization per-game
        if (settingsData && settingsData.gameMode === 'random') {
          // Fisher-Yates shuffle algorithm for true randomization each game
          const shuffled = [...fetchedQuestions];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          setQuestions(shuffled);
          console.log("🎲 Questions randomized for this game session!");
        } else {
          setQuestions(fetchedQuestions);
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
    const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hours}:${mins}:${secs}`;
  };

  const formatPenaltyTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return secs > 0 ? `${mins} minute${mins > 1 ? 's' : ''} and ${secs} second${secs > 1 ? 's' : ''}` : `${mins} minute${mins > 1 ? 's' : ''}`;
    }
    return `${secs} second${secs > 1 ? 's' : ''}`;
  };

  // Add airplane animation function
  const animateAirplaneMovement = () => {
    const airplane = document.querySelector('.game-airplane-current');
    if (airplane) {
      airplane.classList.add('game-airplane-moving');
      setTimeout(() => {
        airplane.classList.remove('game-airplane-moving');
      }, 1200); // Duration matches the CSS animation
    }
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
    const confirmed = window.confirm(`Submit answer? Wrong answers add a ${penaltyText} penalty.`);
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
        // Animate airplane movement before going to next question
        animateAirplaneMovement();
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 600); // Wait for half the animation to complete
      }
    } else {
      alert("Incorrect.");
      wrongAnswers.current += 1;
      timePenalty.current += gameSettings.wrongAnswerPenalty;
      setUserAnswer("");

      // Don't finish quiz, don't move to next question - let them try again
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

    // Show correct answer first, then fun fact
    const currentQuestion = questions[currentIndex];
    const correctAnswer = Array.isArray(currentQuestion.answer) 
      ? currentQuestion.answer[0] 
      : currentQuestion.answer;
    
    alert(`The correct answer was: ${correctAnswer}`);
    
    const funFact = currentQuestion.funFact || "No fun fact available.";
    alert(`🎉 Fun Fact: ${funFact}`);

    const isLast = currentIndex === questions.length - 1;
    if (isLast) {
      handleFinish(false);
    } else {
      // Animate airplane movement before going to next question
      animateAirplaneMovement();
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 600); // Wait for half the animation to complete
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

    // Store correct answers count in sessionStorage for ResultPage
    sessionStorage.setItem("correctAnswers", finalCorrect.toString());
    sessionStorage.setItem("totalQuestions", questions.length.toString());

    window.location.href = "/results";
  };

  const currentQuestion = questions[currentIndex];
  if (questions.length === 0 || !gameSettings) return (
    <div className="game-page-wrapper">
      <div className="game-loading">Loading questions...</div>
    </div>
  );
  if (!currentQuestion) return (
    <div className="game-page-wrapper">
      <div className="game-loading">Loading question...</div>
    </div>
  );

  return (
    <div className="game-page-wrapper">
      {/* Header with logo and time */}
      <div className="game-header">
        <div className="game-logo-container">
          <img src="/images/ces.jpg" alt="Changi Experience Studio" className="game-ces-logo" />
        </div>
        <div className="game-time-display">
          Time: {formatTime(elapsed)}
        </div>
      </div>

      {/* Progress section */}
      <div className="game-progress-section">
        <div className="game-progress-text">
          Progress: {currentIndex + 1}/{questions.length}
        </div>
        <div className="game-progress-bar-container">
          <div className="game-progress-line"></div>
          <div className="game-progress-track">
            {questions.map((_, index) => (
              <div key={index} className="game-progress-item">
                {index === currentIndex ? (
                  <span className="game-airplane-current">✈️</span>
                ) : (
                  <div
                    className={`game-progress-dot ${index < currentIndex ? 'game-progress-completed' : 'game-progress-pending'}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question section */}
      <div className="game-question-section">
        <div className="game-question-header">
          <span className="game-airplane-small">✈️</span>
          Stop {currentIndex + 1}: {currentQuestion.title || `Question ${currentIndex + 1}`}
        </div>
        <div className="game-question-text">
          {currentQuestion.question}
        </div>
      </div>

      {/* Answer input */}
      <div className="game-answer-section">
        <input
          type="text"
          placeholder="Type your answer here"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="game-answer-input"
          autoFocus
        />
      </div>

      {/* Top Action buttons - Hint and Skip */}
      <div className="game-top-actions-section">
        <button 
          onClick={handleHintClick}
          className="game-hint-button"
        >
          Hint (-{Math.floor(gameSettings.hintPenalty / 60)} min)
        </button>
        <button 
          onClick={handleSkip}
          className="game-skip-button"
        >
          Skip (-{Math.floor(gameSettings.skipPenalty / 60)} min)
        </button>
      </div>

      {/* Submit button - separated at bottom */}
      <div className="game-submit-section">
        <button 
          onClick={handleSubmit}
          className="game-submit-button"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};

export default QuestionPage;