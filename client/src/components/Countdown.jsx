import React, { useEffect, useState } from "react";

export default function Countdown({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    let interval;

    if (count > 0) {
      interval = setInterval(() => {
        setCount(prev => {
          if (prev === 1) {
            clearInterval(interval);
            return "GO!";
          }
          return prev - 1;
        });
      }, 1000);
    } else if (count === "GO!") {
      const timeout = setTimeout(() => {
        onComplete(); // ✅ Called only once after "GO!"
      }, 800);

      return () => clearTimeout(timeout); // cleanup
    }

    return () => clearInterval(interval); // cleanup
  }, [count, onComplete]);

  return (
    <div style={{
      fontSize: "64px",
      textAlign: "center",
      marginTop: "100px",
      animation: "pop 0.5s ease"
    }}>
      {count}
    </div>
  );
}
