import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

export default function EnterUsername() {
  const [form, setForm] = useState({ username: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const savedUsername = sessionStorage.getItem("username");
    if (savedUsername) {
      setForm({ username: savedUsername });
    }
  }, []);

  const updateForm = (value) => {
    setForm((prev) => ({ ...prev, ...value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.username.trim()) {
      setError("Please enter your name.");
      return;
    }

    sessionStorage.setItem("username", form.username);
    navigate("/getcode");
  };

  return (
    <div className="home-container">
      <img src="/images/changihome.jpg" alt="Background" className="home-background" />
      <div className="home-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="CES Logo" />
      </div>

      <button
        className="return-button"
        style={{ position: "absolute", bottom: "24px", left: "24px", zIndex: 2, width: "auto", padding: "10px 24px" }}
        onClick={() => navigate("/")}
      >
        Back
      </button>

      <div className="page-content">
        <h1 style={{
          fontSize: "1.8rem",
          fontFamily: "serif",
          fontWeight: "bold",
          marginBottom: "1.5rem",
          lineHeight: "1.5"
        }}>
          Hi there! Welcome to the Changi<br />Experience Studio @ Jewel!
        </h1>

        <p style={{ marginBottom: "2rem", fontSize: "1.1rem" }}>
          How should I address you on this journey?
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            value={form.username}
            onChange={(e) => updateForm({ username: e.target.value })}
            style={{
              padding: "12px 20px",
              fontSize: "16px",
              borderRadius: "30px",
              border: "1px solid #ccc",
              width: "100%",
              maxWidth: "260px",
              marginBottom: "1.2rem",
              textAlign: "center"
            }}
          />
          <br />
          <button type="submit" className="share-button" style={{ maxWidth: "200px", width: "100%" }}>
            Let's Go
          </button>
          {error && <div style={{ color: "red", marginTop: "12px" }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}
