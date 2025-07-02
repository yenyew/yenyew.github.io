import React, { useEffect, useState } from "react";

export default function Countdown({ onComplete }) {
  const [count, setCount] = useState(3); // Starts at 3 → this will count down (3,2,1,GO!)
  const [animate, setAnimate] = useState(true); // Triggers the pop animation when the number changes

  useEffect(() => {
    let interval; // will hold each setTimeout so we can clean it later

    if (count > 1) {
      // If we're at 3 or 2 → count down to the next number
      interval = setTimeout(() => {
        setAnimate(false); // stop the animation first
        setTimeout(() => {
          setCount(prev => prev - 1); // subtract 1 from the current count
          setAnimate(true); // re-trigger animation for new number
        }, 100); // small delay to reset animation smoothly
      }, 1000); // wait 1 second before moving to next number
    } else if (count === 1) {
      // When we reach 1 → after 1 second, show "GO!"
      interval = setTimeout(() => {
        setCount("GO!");
        setAnimate(true); // animate "GO!"
      }, 1000);
    } else if (count === "GO!") {
      // After showing "GO!" → after 0.8 sec, call the onComplete callback to start the game
      const timeout = setTimeout(() => {
        onComplete();
      }, 800);
      return () => clearTimeout(timeout); // clean up timeout
    }

    // Clean up current interval when count changes or component unmounts
    return () => clearTimeout(interval);
  }, [count, onComplete]);


  return (
    <>
      <div className="countdown-overlay">
        <div className={`countdown-text ${animate ? "pop" : ""}`}>
          {count}
        </div>
      </div>

      <style>
        {`
          .countdown-overlay {
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            background-color: rgba(255, 255, 255, 0.5);
            height: 100%;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .countdown-text {
            font-size: 5rem;
            font-weight: bold;
            color: #00bcd4;
            transition: transform 0.3s ease, opacity 0.3s ease;
          }

          .countdown-text.pop {
            animation: pop-scale 0.6s ease;
          }

          @keyframes pop-scale {
            0% {
              transform: scale(0.2);
              opacity: 0;
            }
            50% {
              transform: scale(1.4);
              opacity: 1;
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </>
  );
}
