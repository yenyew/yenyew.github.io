import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MainStyles.css";

const BadUsernames = () => {
  const [badUsernames, setBadUsernames] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [bulkUsernames, setBulkUsernames] = useState("");
  const [loading, setLoading] = useState(true);
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
      return;
    }

    fetchBadUsernames();
  }, [navigate]);

  const fetchBadUsernames = async () => {
    try {
      const response = await fetch("http://localhost:5000/bad-usernames");
      const data = await response.json();
      setBadUsernames(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching bad usernames:", error);
      setLoading(false);
    }
  };

  const handleAddUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    // Handle multiple usernames separated by commas
    const usernamesToAdd = newUsername.split(',').map(u => u.trim()).filter(u => u.length > 0);
    
    if (usernamesToAdd.length === 0) {
      alert("Please enter at least one valid username");
      return;
    }

    try {
      // Add each username individually
      for (const username of usernamesToAdd) {
        const response = await fetch("http://localhost:5000/bad-usernames", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: username }),
        });

        if (!response.ok) {
          const data = await response.json();
          console.error(`Failed to add ${username}:`, data.message);
        }
      }

      alert(`${usernamesToAdd.length} username(s) added to prohibited list!`);
      setNewUsername("");
      fetchBadUsernames();
    } catch (error) {
      console.error("Error adding usernames:", error);
      alert("Server error");
    }
  };

  const handleBulkUpdateToggle = () => {
    if (!showBulkUpdate) {
      // When opening bulk update, populate with current usernames
      setBulkUsernames(badUsernames.join(", "));
    } else {
      // When closing, clear the textarea
      setBulkUsernames("");
    }
    setShowBulkUpdate(!showBulkUpdate);
  };

  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    if (!bulkUsernames.trim()) return;

    // Parse bulk usernames
    const usernamesToUpdate = bulkUsernames.split(',').map(u => u.trim()).filter(u => u.length > 0);
    
    if (usernamesToUpdate.length === 0) {
      alert("Please enter at least one valid username");
      return;
    }

    if (!window.confirm(`This will replace the entire prohibited list with ${usernamesToUpdate.length} username(s). Are you sure?`)) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/bad-usernames", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: usernamesToUpdate }),
      });

      if (response.ok) {
        alert("Prohibited usernames list updated successfully!");
        setBulkUsernames("");
        setShowBulkUpdate(false);
        fetchBadUsernames();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update usernames");
      }
    } catch (error) {
      console.error("Error updating usernames:", error);
      alert("Server error");
    }
  };

  const handleDeleteUsername = async (usernameToDelete) => {
    if (!window.confirm(`Are you sure you want to remove "${usernameToDelete}" from the prohibited list?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/bad-usernames/${usernameToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Username removed from prohibited list!");
        fetchBadUsernames();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to remove username");
      }
    } catch (error) {
      console.error("Error removing username:", error);
      alert("Server error");
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <img src="/images/changihome.jpg" alt="Background" className="background-image" />
        <div className="page-overlay"></div>
        <div className="buttons">
          <p style={{ fontSize: "18px", textAlign: "center", color: "#000" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>

      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="buttons">
        <h2 style={{ color: "#000", fontSize: "24px", marginBottom: "20px" }}>
          Manage Prohibited Usernames
        </h2>

        {/* Add Username Form */}
        <form onSubmit={handleAddUsername} style={{ maxWidth: "300px", width: "100%", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter username to prohibit"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            className="login-btn"
            style={{ marginBottom: "8px", backgroundColor: "white" }}
          />
          <p style={{ fontSize: "12px", color: "#666", textAlign: "center", marginBottom: "10px" }}>
            💡 Tip: Separate multiple usernames with commas (e.g., "user1, user2, user3")
          </p>
          <button
            type="submit"
            className="login-btn"
            style={{
              background: "linear-gradient(90deg, #C4EB22, #17C4C4)",
              color: "black",
              width: "100%",
              marginBottom: "10px"
            }}
          >
            Add to Prohibited List
          </button>
        </form>

        {/* Bulk Update Toggle */}
        <button
          onClick={handleBulkUpdateToggle}
          className="login-btn"
          style={{
            backgroundColor: "#f39c12",
            color: "white",
            width: "100%",
            maxWidth: "300px",
            marginBottom: "20px"
          }}
        >
          {showBulkUpdate ? "Cancel Bulk Update" : "Bulk Update List"}
        </button>

        {/* Bulk Update Form */}
        {showBulkUpdate && (
          <form onSubmit={handleBulkUpdate} style={{ maxWidth: "300px", width: "100%", marginBottom: "20px" }}>
            <textarea
              placeholder="Enter all prohibited usernames"
              value={bulkUsernames}
              onChange={(e) => setBulkUsernames(e.target.value)}
              required
              className="login-btn"
              style={{ 
                marginBottom: "8px", 
                backgroundColor: "white", 
                height: "100px", 
                resize: "vertical",
                borderRadius: "20px"
              }}
            />
            <p style={{ fontSize: "12px", color: "#e74c3c", textAlign: "center", marginBottom: "10px" }}>
              ⚠️ Warning: This will replace the entire list! Use commas to separate usernames.
            </p>
            <button
              type="submit"
              className="login-btn"
              style={{
                background: "linear-gradient(90deg, #e74c3c, #c0392b)",
                color: "white",
                width: "100%",
                marginBottom: "10px"
              }}
            >
              Replace Entire List
            </button>
          </form>
        )}

        {/* Current List */}
        <div style={{ maxWidth: "400px", width: "100%", marginBottom: "30px" }}>
          <h3 style={{ color: "#000", fontSize: "18px", marginBottom: "15px" }}>
            Current Prohibited Usernames ({badUsernames.length})
          </h3>
          
          {badUsernames.length === 0 ? (
            <p style={{ color: "#666", fontSize: "14px", textAlign: "center" }}>
              No prohibited usernames yet
            </p>
          ) : (
            <div style={{ 
              maxHeight: "200px", 
              overflowY: "auto", 
              border: "1px solid #ccc", 
              borderRadius: "10px", 
              padding: "10px",
              backgroundColor: "rgba(255, 255, 255, 0.8)"
            }}>
              {badUsernames.map((username, index) => (
                <div key={index} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: index < badUsernames.length - 1 ? "1px solid #eee" : "none"
                }}>
                  <span style={{ fontSize: "14px", color: "#333" }}>{username}</span>
                  <button
                    onClick={() => handleDeleteUsername(username)}
                    style={{
                      background: "#cc4125",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/admin")}
          className="login-btn"
          style={{ 
            marginTop: "20px", 
            width: "100%", 
            maxWidth: "300px",
            backgroundColor: "#007b8a",
            color: "black"
          }}
        >
          Return
        </button>
      </div>
    </div>
  );
};

export default BadUsernames;