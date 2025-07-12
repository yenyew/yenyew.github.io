import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css"; // Use MainStyles instead of LoginScreen

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
        navigate("/admin");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="home-container">
      <img src="/images/changihome.jpg" alt="Background" className="home-background" />
      <div className="home-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="home-content">
        <div className="title-block">
          <h1>Admin Login</h1>
        </div>

        <div className="description-block">
          <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}>
            {error && (
              <div style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>
                {error}
              </div>
            )}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "12px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                marginBottom: "16px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
                boxSizing: "border-box"
              }}
            />
            <div className="home-buttons">
              <button type="submit">Log In</button>
              <button type="button" onClick={handleGoHome}>Go to Home</button>
            </div>
          </form>

          <div className="jewel-logo-wrapper">
            <img src="/images/jewel.png" alt="Jewel Logo" />
          </div>
        </div>
      </div>

      {/* Commented out for now
      <div className="footer">
        <div className="language">
          <img src="/images/globe.png" alt="Globe Icon" className="globe-icon" />
          <span>English</span>
        </div>
      </div>
      */}
    </div>
  );
};

export default LoginScreen;