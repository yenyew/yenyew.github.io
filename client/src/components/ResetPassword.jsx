import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./MainStyles.css";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState("request");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 🔍 Check if token exists in URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get("token");

    if (urlToken) {
      setToken(urlToken);
      setStage("reset"); // Auto-show reset form
    }
  }, [location.search]);

  const handleRequestToken = async () => {
    try {
      const res = await fetch("http://localhost:5000/admins/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Reset link sent to your email.");
      } else {
        setMessage(data.message || "Failed to send reset link.");
      }
    } catch (err) {
      setMessage("Server error while sending email.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await fetch("http://localhost:5000/admins/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful!");
        navigate("/login");
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setMessage("Server error during password reset.");
    }
  };

  return (
    <div className="home-container">
      {/* Background + Logo */}
      <img src="/images/changihome.jpg" alt="Background" className="home-background" />
      <div className="home-overlay" />
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="CES Logo" />
      </div>

      {/* Content Block */}
      <div className="home-content">
        <div className="title-block"><h1>Reset Password</h1></div>
        <div className="description-block" style={{ maxWidth: "360px", margin: "0 auto" }}>
          {message && <p style={{ color: "white", marginBottom: "16px" }}>{message}</p>}

          {stage === "request" ? (
            <>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
              <button className="login-btn" onClick={handleRequestToken}>Request Reset Link</button>
            </>
          ) : (
            <>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
              />
              <button className="login-btn" onClick={handleResetPassword}>Reset Password</button>
            </>
          )}

          <button
            className="login-btn"
            style={{ backgroundColor: "#ccc", color: "#000", marginTop: "10px" }}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  fontSize: "16px",
  boxSizing: "border-box",
};

export default ResetPassword;
