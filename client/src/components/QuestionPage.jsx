import React, { useState, useEffect, useRef } from "react";
import AlertModal from './AlertModal';
import "./MainStyles.css";
import "./QuestionPage.css";

const QuestionPage = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameSettings, setGameSettings] = useState(null);
  const [timerPaused, setTimerPaused] = useState(false);

  // Modal states
  const [showHintModal, setShowHintModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoType, setInfoType] = useState("info");

  const startTime = useRef(Date.now());
  const wrongAnswers = useRef(0);
  const questionsSkipped = useRef(0);
  const timePenalty = useRef(0);
  const pausedTime = useRef(0);

  // ✅ Timer control functions
  const pauseTimer = () => {
    if (!timerPaused) {
      setTimerPaused(true);
      pausedTime.current += Date.now() - startTime.current;
    }
  };

  const resumeTimer = () => {
    if (timerPaused) {
      setTimerPaused(false);
      startTime.current = Date.now();
    }
  };

  // Helper functions for modals
  const showInfo = (title, message, type = "info") => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoType(type);
    setShowInfoModal(true);
    // Timer keeps running for hints, warnings, etc.
  };

  const showAnswerInfo = (title, message, type = "success") => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoType(type);
    setShowAnswerModal(true);
    pauseTimer(); // ✅ Pause for feedback
  };

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
        } else {
          setQuestions(fetchedQuestions);
        }
        
      } catch (error) {
        console.error("Failed to fetch questions and settings:", error);
      }
    };

    fetchQuestionsAndSettings();
  }, []);

  // ✅ Modified timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!timerPaused) {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime.current - pausedTime.current) / 1000) + timePenalty.current);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timerPaused]);

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

  // ✅ Modal handlers
  const handleHintClick = () => {
    const hint = questions[currentIndex]?.hint;
    if (!hint || !gameSettings) return;
    setShowHintModal(true);
  };

  const confirmHint = () => {
    const hint = questions[currentIndex]?.hint;
    setHintsUsed((prev) => prev + 1);
    timePenalty.current += gameSettings.hintPenalty;
    showInfo("💡 Hint", hint, "info");
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion || !gameSettings) return;

    if (!userAnswer.trim()) {
      showInfo("Missing Answer", "Please enter your answer.", "warning");
      return;
    }

    setShowSubmitModal(true);
  };

  // ✅ Modified confirmSubmit - don't trigger animation here
  const confirmSubmit = () => {
    const currentQuestion = questions[currentIndex];
    const input = userAnswer.toLowerCase().trim();
    const acceptableAnswers = Array.isArray(currentQuestion.answer)
      ? currentQuestion.answer
      : [currentQuestion.answer];

    const isCorrect = acceptableAnswers.some(
      (ans) => ans.toLowerCase().trim() === input
    );

    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
      setUserAnswer("");
      
      const funFact = questions[currentIndex].funFact || "No fun fact available.";
      showAnswerInfo("Correct!", funFact, "success");
      
      // ❌ Don't trigger animation here - wait for modal close
    } else {
      wrongAnswers.current += 1;
      timePenalty.current += gameSettings.wrongAnswerPenalty;
      setUserAnswer("");
      showAnswerInfo("Incorrect", "Try again! You can still answer this question.", "error");
    }
  };

  const handleSkip = () => {
    if (!gameSettings) return;
    setShowSkipModal(true);
  };

  // ✅ Modified confirmSkip - don't trigger animation here
  const confirmSkip = () => {
    timePenalty.current += gameSettings.skipPenalty;
    questionsSkipped.current += 1;
    setUserAnswer("");

    // Show correct answer and fun fact
    const currentQuestion = questions[currentIndex];
    const correctAnswer = Array.isArray(currentQuestion.answer) 
      ? currentQuestion.answer[0] 
      : currentQuestion.answer;
    
    const funFact = currentQuestion.funFact || "No fun fact available.";
    const message = `The correct answer was: ${correctAnswer}\n\n🎉 Fun Fact: ${funFact}`;
    
    showAnswerInfo("⏭️ Question Skipped", message, "warning");
    // ❌ Don't progress here - wait for modal close
  };

  // ✅ Handle answer modal close - trigger progression
  const handleAnswerModalClose = () => {
    setShowAnswerModal(false);
    resumeTimer(); // ✅ Resume timer
    
    // Check if we should progress to next question
    const isCorrectAnswer = infoType === "success";
    const isSkipped = infoType === "warning";
    const isLast = currentIndex === questions.length - 1;
    
    if (isCorrectAnswer || isSkipped) {
      if (isLast) {
        handleFinish(isCorrectAnswer);
      } else {
        // ✅ NOW trigger animation and progression
        animateAirplaneMovement();
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 600);
      }
    }
  };

  const handleFinish = async (answeredLast) => {
    const finalCorrect = correctAnswers + (answeredLast ? 1 : 0);
    const rawTime = Math.floor((Date.now() - startTime.current - pausedTime.current) / 1000);
    const finalTime = rawTime + timePenalty.current;

    showInfo("🎊 Quiz Complete!", "Great job! Redirecting to results...", "success");

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

    setTimeout(() => {
      window.location.href = "/results";
    }, 2000);
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

  const penaltyText = gameSettings ? {
    hint: formatPenaltyTime(gameSettings.hintPenalty),
    skip: formatPenaltyTime(gameSettings.skipPenalty),
    wrong: formatPenaltyTime(gameSettings.wrongAnswerPenalty)
  } : { hint: "", skip: "", wrong: "" };

  return (
    <div className="game-page-wrapper">
      {/* Header with logo and time */}
      <div className="game-header">
        <div className="game-logo-container">
          <img src="/images/ces.jpg" alt="Changi Experience Studio" className="game-ces-logo" />
        </div>
        <div className="game-time-display">
          Time: {formatTime(elapsed)} {timerPaused && <span style={{color: "#ff9800"}}>(⏸️ Paused)</span>}
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
        
        {/* Image support from main branch */}
        {questions[currentIndex].image && (
          <img
            src={`http://localhost:5000/${questions[currentIndex].image}`}
            alt={`Question ${currentIndex + 1}`}
            style={{
              maxWidth: "90%",
              maxHeight: "300px",
              marginTop: "15px",
              borderRadius: "12px",
              display: "block",
              margin: "15px auto 0 auto"
            }}
          />
        )}
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

      {/* 💡 Hint Confirmation Modal */}
      <AlertModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        onConfirm={confirmHint}
        title="Use Hint?"
        message={`Using a hint will add a ${penaltyText.hint} penalty to your time.`}
        confirmText="Use Hint"
        cancelText="Cancel"
        type="warning"
        icon="💡"
      />

      {/* ⏭️ Skip Confirmation Modal */}
      <AlertModal
        isOpen={showSkipModal}
        onClose={() => setShowSkipModal(false)}
        onConfirm={confirmSkip}
        title="Skip Question?"
        message={`Skipping this question will add a ${penaltyText.skip} penalty to your time.`}
        confirmText="Skip"
        cancelText="Cancel"
        type="warning"
        icon="⏭️"
      />

      {/* 📝 Submit Confirmation Modal */}
      <AlertModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        onConfirm={confirmSubmit}
        title="Submit Answer?"
        message={`Are you sure? Wrong answers add a ${penaltyText.wrong} penalty.`}
        confirmText="Submit"
        cancelText="Cancel"
        type="info"
        icon="📝"
      />

      {/* ℹ️ General Info Modal */}
      <AlertModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={infoTitle}
        message={infoMessage}
        confirmText="OK"
        type={infoType}
        showCancel={false}
      />

      {/* 🎯 Answer Result Modal - custom close handler */}
      <AlertModal
        isOpen={showAnswerModal}
        onClose={handleAnswerModalClose}
        title={infoTitle}
        message={infoMessage}
        confirmText="Continue"
        type={infoType}
        showCancel={false}
      />
    </div>
  );
};

export default QuestionPage;