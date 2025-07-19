import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Questions.css";
import "./MainStyles.css";

const CollectionsBank = () => {
  const [collections, setCollections] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("You must be logged in to access this page.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch("http://localhost:5000/collections/");
        const data = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setCollections([]);
      }
    };
    fetchCollections();
  }, []);

  const handleEdit = (code) => {
    navigate(`/collections/${code}`, { state: { from: "collections" } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection? Associated questions will remain in the database.")) return;

    try {
      const res = await fetch(`http://localhost:5000/collections/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Collection deleted successfully. Questions remain in the database.");
        setCollections((prev) => prev.filter((col) => col._id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete the collection: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      alert("Error deleting collection.");
    }
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="scroll-wrapper">
        <div className="buttons" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h1 style={{ color: "#000", fontSize: "32px", textAlign: "center", marginBottom: "12px" }}>
            Collections Bank
          </h1>

          <div style={{ maxHeight: "65vh", overflowY: "auto", width: "100%" }}>
            {collections.length === 0 ? (
              <p>No collections found.</p>
            ) : (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {collections.map((col) => (
                  <li
                    key={col._id}
                    onClick={() => navigate(`/collections/${col.code}`)}
                    style={{
                      background: "#fff",
                      borderRadius: "8px",
                      padding: "10px",
                      marginBottom: "8px",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <strong>{col.name}</strong>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "#666",
                          backgroundColor: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Code: {col.code}
                      </span>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      {col.questionOrder?.length || 0} Questions
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(col.code);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(col._id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => navigate("/add-collection")}
              className="login-btn"
              style={{ backgroundColor: "#28a745", color: "#000" }}
            >
              Add New Collection
            </button>
            <button
              onClick={() => navigate("/admin")}
              className="login-btn"
              style={{ backgroundColor: "#17C4C4", color: "#000" }}
            >
              Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionsBank;