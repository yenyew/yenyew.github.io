import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateCollection = () => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });

      if (res.ok) {
        alert("Collection created successfully!");
        navigate("/admin");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create collection.");
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      alert("Server error");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="header">
        <button
          onClick={() => navigate("/collections")}
          className="login-btn"
          style={{
            backgroundColor: "#17C4C4",
            color: "#fff",
            width: "120px",
            marginBottom: "10px",
          }}
        >
          &lt; Back
        </button>
      </div>

      <div className="buttons">
        <h2 style={{ color: "#000", fontSize: "24px", marginBottom: "10px" }}>
          Create New Collection
        </h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
          <input
            type="text"
            placeholder="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <input
            type="text"
            placeholder="Collection Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "10px", backgroundColor: "white" }}
          />
          <button
            type="submit"
            className="login-btn"
            style={{
              background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
              color: "black",
              width: "100%",
            }}
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCollection;
