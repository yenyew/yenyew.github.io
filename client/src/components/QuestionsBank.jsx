import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Questions.css";
import "./MainStyles.css";

// Random code generator function
const generateRandomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const QuestionsBank = () => {
  const [questions, setQuestions] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionCode, setCollectionCode] = useState("");
  const [selectedCollection, setSelectedCollection] = useState(null); 
  const [, setCollectionId] = useState(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionCodeInput, setCollectionCodeInput] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const passedCode = queryParams.get("collection");

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
        setCollections(data);

        if (data.length > 0 && !collectionCode) {
          const codeToSet = passedCode || "all";
          setCollectionCode(codeToSet);
          const selectedCol = data.find(col => col.code === codeToSet);
          setSelectedCollection(selectedCol);
        }
      } catch (err) {
        console.error("Error fetching collections:", err);
      }
    };
    fetchCollections();
  }, [passedCode, collectionCode]);

  useEffect(() => {
    const collection = collections.find(col => col.code === collectionCode);
    if (collection && collection._id) {
      setCollectionId(collection._id);
    }
  }, [collectionCode, collections]);

  useEffect(() => {
    if (!collectionCode) return;
    if (collectionCode === "all") {
      fetchAllQuestions();
    } else {
      fetchQuestions(collectionCode);
    }
  }, [collectionCode]);

  const fetchQuestions = async (code) => {
    try {
      const response = await fetch(`http://localhost:5000/collections/${code}/questions`);
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestions([]);
    }
  };

  const fetchAllQuestions = async () => {
    try {
      const response = await fetch("http://localhost:5000/questions");
      const data = await response.json();
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error("Error fetching all questions:", err);
      setQuestions([]);
    }
  };

  const getCollectionName = (collectionId) => {
    const collection = collections.find(col => col._id === collectionId);
    return collection ? collection.name : "Unknown Collection";
  };

  const handleEdit = (number, questionCollectionId) => {
    if (collectionCode === "all") {
      if (!questionCollectionId) {
        alert("Cannot edit: Question collection ID not found.");
        return;
      }
      navigate(`/edit-question/${number}/${questionCollectionId}`);
    } else {
      if (!selectedCollection) {
        alert("Collection not selected");
        return;
      }
      navigate(`/edit-question/${number}/${selectedCollection._id}`);
    }
  };

  const handleDelete = async (number, questionCollectionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    if (!questionCollectionId) {
      alert("Collection ID not found for this question.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/questions/${number}/${questionCollectionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Question deleted.");
        setQuestions((prev) =>
          prev.filter((q) => !(q.number === number && q.collectionId === questionCollectionId))
        );
      } else {
        const data = await res.json();
        alert(`Failed to delete the question: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting question:", err);
    }
  };

  // Collection management functions
  const handleEditCollection = (collection) => {
    setEditCollection(collection);
    setCollectionName(collection.name);
    setCollectionCodeInput(collection.code);
    setShowCollectionModal(true);
  };

  const handleDeleteCollection = async (collection) => {
    if (!window.confirm(`Are you sure you want to delete "${collection.name}" collection? This will also delete all questions in this collection!`)) return;

    try {
      const res = await fetch(`http://localhost:5000/collections/${collection._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Collection deleted successfully!");
        // Refresh collections
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
        
        // Reset to "all" if current collection was deleted
        if (collectionCode === collection.code) {
          setCollectionCode("all");
          navigate("/questions?collection=all");
        }
      } else {
        const data = await res.json();
        alert(`Failed to delete collection: ${data.message}`);
      }
    } catch (err) {
      console.error("Error deleting collection:", err);
      alert("Error deleting collection. Please try again.");
    }
  };

  const handleSaveCollection = async (e) => {
    e.preventDefault();
    
    if (!collectionName.trim()) {
      alert("Please enter a collection name.");
      return;
    }
    
    if (!collectionCodeInput.trim()) {
      alert("Please enter a collection code.");
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:5000/collections/${editCollection._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: collectionName.trim(),
          code: collectionCodeInput.trim()
        }),
      });
  
      if (res.ok) {
        alert("Collection updated successfully!");
        setShowCollectionModal(false);
        setEditCollection(null);
        
        // Refresh collections
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
        
        // Update selectedCollection with the new data
        const updatedCollection = data.find(col => col._id === editCollection._id);
        setSelectedCollection(updatedCollection);
        
        // Update current selection if code changed
        if (collectionCode === editCollection.code) {
          setCollectionCode(collectionCodeInput.trim());
          // Navigate to the new code but don't add to history
          window.history.replaceState(null, '', `/questions?collection=${collectionCodeInput.trim()}`);
        }
        
        // Clear form
        setCollectionName("");
        setCollectionCodeInput("");
      } else {
        const data = await res.json();
        alert(`Failed to update collection: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating collection:", err);
      alert("Error updating collection. Please try again.");
    }
  };

  // Generate random code function
  const handleGenerateCode = () => {
    const newCode = generateRandomCode();
    setCollectionCodeInput(newCode);
  };

  const closeModal = () => {
    setShowCollectionModal(false);
    setEditCollection(null);
    setCollectionName("");
    setCollectionCodeInput("");
  };

  return (
    <div className="login-container">
      <img src="/images/changihome.jpg" alt="Background" className="background-image" />
      <div className="page-overlay"></div>
      <div className="top-left-logo">
        <img src="/images/ces.jpg" alt="Changi Experience Studio" />
      </div>

      <div className="scroll-wrapper">
        <div className="buttons">
          <select
            value={collectionCode}
            onChange={(e) => {
              const selected = e.target.value;
              setCollectionCode(selected);
              const selectedCol = collections.find(col => col.code === selected);
              setSelectedCollection(selectedCol);
              navigate(`/questions?collection=${selected}`);
            }}
            style={{ padding: "8px", fontSize: "16px", marginTop: "30px" }}
          >
            <option value="all">All Questions</option>
            {collections.map((col) => (
              <option key={col._id} value={col.code}>
                {col.name} Collection
              </option>
            ))}
          </select>

          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#000" }}>
            Viewing questions in "{collectionCode === "all" ? "All Collections" : selectedCollection?.name || collectionCode}"
          </p>

          {/* Collection Management Section */}
          {collectionCode !== "all" && selectedCollection && (
            <div style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.9)", 
              padding: "10px", 
              borderRadius: "8px", 
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                Collection: {selectedCollection.name}
              </span>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleEditCollection(selectedCollection)}
                  style={{ 
                    backgroundColor: "#FFC107", 
                    color: "#000", 
                    fontSize: "12px", 
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Edit Collection
                </button>
                <button
                  onClick={() => handleDeleteCollection(selectedCollection)}
                  style={{ 
                    backgroundColor: "#DC3545", 
                    color: "#fff", 
                    fontSize: "12px", 
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Delete Collection
                </button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: "80vh", overflowY: "scroll", width: "100%", marginBottom: "16px" }}>
            {questions.length === 0 ? (
              <p>No questions found.</p>
            ) : (
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {questions.map((q) => (
                  <li
                    key={q._id}
                    style={{ background: "#fff", borderRadius: "8px", padding: "10px", marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => navigate(`/edit-question/${q.number}/${q.collectionId}`)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px" }}>
                      <strong>Q{q.number}:</strong> 
                      {collectionCode === "all" && (
                        <span style={{ 
                          fontSize: "12px", 
                          color: "#666", 
                          backgroundColor: "#f0f0f0", 
                          padding: "2px 6px", 
                          borderRadius: "4px",
                          marginLeft: "10px"
                        }}>
                          {getCollectionName(q.collectionId)}
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      {q.question}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        className="login-btn"
                        style={{ backgroundColor: "#FFC107", color: "#000", fontSize: "14px", padding: "5px 10px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(q.number, q.collectionId);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(q.number, q.collectionId);
                        }}
                        style={{ background: "#DC3545", color: "#fff", fontSize: "14px", padding: "5px 10px" }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
            <button
              onClick={() => navigate("/add-question")}
              className="add-question"
            >
              Add New Question
            </button>
            <button
              onClick={() => navigate("/add-collection")}
              className="add-collection"
            >
              Add New Collection
            </button>
          </div>

          <button onClick={() => navigate("/admin")} className="login-btn" style={{ backgroundColor: "#17C4C4" }}>
            Return
          </button>
        </div>
      </div>

      {/* Collection Edit Modal */}
      {showCollectionModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            width: "90%",
            maxWidth: "400px"
          }}>
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Edit Collection</h3>
            <form onSubmit={handleSaveCollection}>
              <input
                type="text"
                placeholder="Collection Name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                  boxSizing: "border-box"
                }}
              />
              
              {/* Updated Collection Code section with generate button */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                  <input
                    type="text"
                    placeholder="Collection Code"
                    value={collectionCodeInput}
                    onChange={(e) => setCollectionCodeInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px",
                      borderRadius: "5px",
                      border: "1px solid #ccc",
                      boxSizing: "border-box"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#17C4C4",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "18px",
                      whiteSpace: "nowrap",
                      width: "120px"
                    }}
                  >
                    Generate
                  </button>
                </div>
                <p style={{ 
                  fontSize: "11px", 
                  color: "#666", 
                  margin: "0",
                  textAlign: "center"
                }}>
                  💡 Tip: Generate a random 6-character code or enter your own
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    flex: 1,
                    padding: "10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsBank;