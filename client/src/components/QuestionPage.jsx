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
  const [error, setError] = useState(null);

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

  const showInfo = (title, message, type = "info") => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoType(type);
    setShowInfoModal(true);
  };

  const showAnswerInfo = (title, message, type = "success") => {
    setInfoTitle(title);
    setInfoMessage(message);
    setInfoType(type);
    setShowAnswerModal(true);
    pauseTimer();
  };

  useEffect(() => {
    const fetchQuestionsAndSettings = async () => {
      const collectionId = sessionStorage.getItem("collectionId");
      if (!collectionId) {
        setError("No collection selected. Please enter a code or play as a guest.");
        return;
      }

      try {
        const settingsResponse = await fetch(`http://localhost:5000/collections/${collectionId}/effective-settings`);
        if (!settingsResponse.ok) {
          const data = await settingsResponse.json();
          setError(data.message || "Failed to load game settings.");
          return;
        }
        const settingsData = await settingsResponse.json();
        setGameSettings(settingsData);

        const collectionRes = await fetch(`http://localhost:5000/collections/${collectionId}`);
        const collection = await collectionRes.json();

        if (!collection) {
          setError("Collection not found or is offline.");
          return;
        }

        let fetchedQuestions = [];
        if (collection.questionOrder && collection.questionOrder.length > 0) {
          const response = await fetch(`http://localhost:5000/collections/${collection._id}/questions`);
          if (!response.ok) {
            const data = await response.json();
            setError(data.message || "Failed to load questions.");
            return;
          }
          const data = await response.json();
          fetchedQuestions = Array.isArray(data) ? data : data.questions || [];
        } else {
          const res = await fetch(`http://localhost:5000/questions?collectionId=${collectionId}`);
          if (!res.ok) {
            const data = await res.json();
            setError(data.message || "Failed to load questions.");
            return;
          }
          const data = await res.json();
          fetchedQuestions = data;
        }

        if (settingsData && settingsData.gameMode === 'random') {
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
        setError("Something went wrong. Please try again later.");
      }
    };

    fetchQuestionsAndSettings();
  }, []);

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

  const animateAirplaneMovement = () => {
    const airplane = document.querySelector('.game-airplane-current');
    if (airplane) {
      airplane.classList.add('game-airplane-moving');
      setTimeout(() => {
        airplane.classList.remove('game-airplane-moving');
      }, 1200);
    }
  };

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
      const funFact = currentQuestion.funFact || "No fun fact available.";
      showAnswerInfo("Correct!", funFact, "success");
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

  const confirmSkip = () => {
    timePenalty.current += gameSettings.skipPenalty;
    questionsSkipped.current += 1;
    setUserAnswer("");
    const currentQuestion = questions[currentIndex];
    const correctAnswer = Array.isArray(currentQuestion.answer)
      ? currentQuestion.answer[0]
      : currentQuestion.answer;
    const funFact = currentQuestion.funFact || "No fun fact available.";
    const message = `The correct answer was: ${correctAnswer}\n\n🎉 Fun Fact: ${funFact}`;
    showAnswerInfo("⏭️ Question Skipped", message, "warning");
  };

  const handleAnswerModalClose = () => {
    setShowAnswerModal(false);
    resumeTimer();
    const isCorrectAnswer = infoType === "success";
    const isSkipped = infoType === "warning";
    const isLast = currentIndex === questions.length - 1;

    if (isCorrectAnswer || isSkipped) {
      if (isLast) {
        handleFinish(isCorrectAnswer);
      } else {
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

    sessionStorage.setItem("correctAnswers", finalCorrect.toString());
    sessionStorage.setItem("totalQuestions", questions.length.toString());

    setTimeout(() => {
      window.location.href = "/results";
    }, 2000);
  };

  if (error) {
    return (
      <div className="game-page-wrapper">
        <AlertModal
          isOpen={true}
          onClose={() => window.location.href = "/getcode"}
          title="Error"
          message={error}
          confirmText="Back to Code Entry"
          type="error"
          showCancel={false}
        />
      </div>
    );
  }

  if (questions.length === 0 || !gameSettings) {
    return <div className="game-loading">Loading questions...</div>;
  }

  const penaltyText = {
    hint: formatPenaltyTime(gameSettings.hintPenalty),
    skip: formatPenaltyTime(gameSettings.skipPenalty),
    wrong: formatPenaltyTime(gameSettings.wrongAnswerPenalty)
  };

  return (
    <div className="game-page-wrapper">
      {/* header */}
      {/* progress tracker */}
      {/* question and answer section */}
      {/* same as before... */}

      <div className="game-answer-section">
        {questions[currentIndex].type === "mcq" ? (
          <>
            <div className="game-mcq-options">
              {questions[currentIndex].options?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setUserAnswer(option)}
                  className={`game-mcq-option-button ${userAnswer === option ? "selected" : ""}`}
                >
                  {option}
                </button>
              ))}
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
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto"
                }}
              />
            )}
          </>
        ) : (
          <input
            type="text"
            placeholder="Type your answer here"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="game-answer-input"
            autoFocus
          />
        )}
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

      {/* Submit button */}
      <div className="game-submit-section">
        <button
          onClick={handleSubmit}
          className="game-submit-button"
        >
          Submit Answer
        </button>
      </div>

      {/* Modals */}
      <AlertModal isOpen={showHintModal} onClose={() => setShowHintModal(false)} onConfirm={confirmHint} title="Use Hint?" message={`Using a hint will add a ${penaltyText.hint} penalty to your time.`} confirmText="Use Hint" cancelText="Cancel" type="warning" icon="💡" />
      <AlertModal isOpen={showSkipModal} onClose={() => setShowSkipModal(false)} onConfirm={confirmSkip} title="Skip Question?" message={`Skipping this question will add a ${penaltyText.skip} penalty to your time.`} confirmText="Skip" cancelText="Cancel" type="warning" icon="⏭️" />
      <AlertModal isOpen={showSubmitModal} onClose={() => setShowSubmitModal(false)} onConfirm={confirmSubmit} title="Submit Answer?" message={`Are you sure? Wrong answers add a ${penaltyText.wrong} penalty.`} confirmText="Submit" cancelText="Cancel" type="info" icon="📝" />
      <AlertModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} title={infoTitle} message={infoMessage} confirmText="OK" type={infoType} showCancel={false} />
      <AlertModal isOpen={showAnswerModal} onClose={handleAnswerModalClose} title={infoTitle} message={infoMessage} confirmText="Continue" type={infoType} showCancel={false} />
    </div>
  );
};

export default QuestionPage;
