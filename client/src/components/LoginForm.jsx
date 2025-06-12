import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginScreen.css"; // Keep your existing styles

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error

    try {
      const response = await fetch("http://localhost:5000/admins/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("jwtToken", data.token);
        alert("Login successful!");
        navigate("/admin"); // Navigate to AdminScreen
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoHome = () => {
    navigate("/"); // Navigate to HomePage
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="overlay"></div>

      <div className="header">
        <img src="/images/ces.jpg" alt="Logo" className="ces-logo" />
        <h2>Admin Login</h2>
      </div>

      <div className="buttons">
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px" }}>
          {error && (
            <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-btn"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-btn"
            style={{ marginTop: "15px" }}
          />
          <button type="submit" className="login-btn" style={{ marginTop: "15px" }}>
            Log In
          </button>
          <button
            type="button"
            className="public-btn"
            style={{ marginTop: "10px" }}
            onClick={handleGoHome}
          >
            Go to Home
          </button>
        </form>
      </div>

      <div className="footer">
        <img src="/images/jewel.png" alt="Jewel Logo" className="jewel-logo" />
        <div className="language">
          <img src="/images/globe.png" alt="Globe Icon" className="globe-icon" />
          <span>English</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
