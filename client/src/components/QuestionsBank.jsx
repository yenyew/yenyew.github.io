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
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showGameSettingsModal, setShowGameSettingsModal] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const [collectionName, setCollectionName] = useState("");
  const [collectionCodeInput, setCollectionCodeInput] = useState("");
  const [orderedQuestions, setOrderedQuestions] = useState([]);
  const [useGlobalSettings, setUseGlobalSettings] = useState(true);
  const [customSettings, setCustomSettings] = useState({
    gameMode: 'default',
    wrongAnswerPenalty: 300,
    hintPenalty: 120,
    skipPenalty: 600
  });
  const [globalSettings, setGlobalSettings] = useState(null);
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
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
        
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
        
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
        
        const updatedCollection = data.find(col => col._id === editCollection._id);
        setSelectedCollection(updatedCollection);
        
        if (collectionCode === editCollection.code) {
          setCollectionCode(collectionCodeInput.trim());
          window.history.replaceState(null, '', `/questions?collection=${collectionCodeInput.trim()}`);
        }
        
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

  // Question ordering functions
  const handleOrderQuestions = () => {
    if (!selectedCollection) return;
    
    // Check if there's already a custom order set
    if (selectedCollection.questionOrder && selectedCollection.questionOrder.length > 0) {
      // Use the existing custom order (questions are already in the right order from fetchQuestions)
      const collectionQuestions = questions.filter(q => q.collectionId === selectedCollection._id);
      setOrderedQuestions(collectionQuestions);
    } else {
      // No custom order yet, start with questions sorted by number
      const collectionQuestions = questions.filter(q => q.collectionId === selectedCollection._id);
      const sortedQuestions = [...collectionQuestions].sort((a, b) => a.number - b.number);
      setOrderedQuestions(sortedQuestions);
    }
    
    setShowOrderModal(true);
  };

  // Quick sort functions
  const quickSortAscending = () => {
    const sorted = [...orderedQuestions].sort((a, b) => a.number - b.number);
    setOrderedQuestions(sorted);
  };
  
  const quickSortDescending = () => {
    const sorted = [...orderedQuestions].sort((a, b) => b.number - a.number);
    setOrderedQuestions(sorted);
  };
  
  const quickSortRandom = () => {
    const shuffled = [...orderedQuestions];
    // Simple Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrderedQuestions(shuffled);
  };

  const handleSaveOrder = async () => {
    if (!selectedCollection) return;

    try {
      const questionIds = orderedQuestions.map(q => q._id);
      
      const res = await fetch(`http://localhost:5000/collections/${selectedCollection._id}/question-order`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionOrder: questionIds }),
      });

      if (res.ok) {
        alert("Question order updated successfully!");
        setShowOrderModal(false);
        
        // Refresh the questions to show the new order
        fetchQuestions(collectionCode);
      } else {
        const data = await res.json();
        alert(`Failed to update question order: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating question order:", err);
      alert("Error updating question order. Please try again.");
    }
  };

  // Move question function for mobile
  const moveQuestion = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= orderedQuestions.length) return;
    
    const newQuestions = [...orderedQuestions];
    const movedQuestion = newQuestions.splice(fromIndex, 1)[0];
    newQuestions.splice(toIndex, 0, movedQuestion);
    
    setOrderedQuestions(newQuestions);
  };

  // Game Settings functions
  const fetchGlobalSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/global-settings");
      const data = await response.json();
      setGlobalSettings(data);
    } catch (error) {
      console.error("Error fetching global settings:", error);
    }
  };

  const handleGameSettings = async () => {
    if (!selectedCollection) return;
    
    // Fetch global settings first
    await fetchGlobalSettings();
    
    // Set current collection settings
    setUseGlobalSettings(selectedCollection.useGlobalSettings ?? true);
    setCustomSettings(selectedCollection.customSettings || {
      gameMode: 'default',
      wrongAnswerPenalty: 300,
      hintPenalty: 120,
      skipPenalty: 600
    });
    
    setShowGameSettingsModal(true);
  };

  const handleSaveGameSettings = async () => {
    if (!selectedCollection) return;

    try {
      const payload = {
        useGlobalSettings,
        customSettings: useGlobalSettings ? null : customSettings
      };

      const res = await fetch(`http://localhost:5000/collections/${selectedCollection._id}/game-settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Game settings updated successfully!");
        setShowGameSettingsModal(false);
        
        // Refresh collections
        const response = await fetch("http://localhost:5000/collections/");
        const data = await response.json();
        setCollections(data);
        
        const updatedCollection = data.find(col => col._id === selectedCollection._id);
        setSelectedCollection(updatedCollection);
      } else {
        const data = await res.json();
        alert(`Failed to update game settings: ${data.message}`);
      }
    } catch (err) {
      console.error("Error updating game settings:", err);
      alert("Error updating game settings. Please try again.");
    }
  };

  const closeGameSettingsModal = () => {
    setShowGameSettingsModal(false);
    setUseGlobalSettings(true);
    setCustomSettings({
      gameMode: 'default',
      wrongAnswerPenalty: 300,
      hintPenalty: 120,
      skipPenalty: 600
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderedQuestions([]);
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
                  onClick={handleOrderQuestions}
                  style={{ 
                    backgroundColor: "#28a745", 
                    color: "#000", 
                    fontSize: "12px", 
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Order Questions
                </button>
                <button
                  onClick={handleGameSettings}
                  style={{ 
                    backgroundColor: "#6f42c1", 
                    color: "#000", 
                    fontSize: "12px", 
                    padding: "4px 8px",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Game Settings
                </button>
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
                    color: "#000",
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
                {questions.map((q, index) => (
                  <li
                    key={q._id}
                    style={{ background: "#fff", borderRadius: "8px", padding: "10px", marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => navigate(`/edit-question/${q.number}/${q.collectionId}`)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px" }}>
                      <strong>
                        {collectionCode !== "all" && selectedCollection?.questionOrder?.length > 0 
                          ? `Game Q${index + 1}: (Original Q${q.number})` 
                          : `Q${q.number}`}
                      </strong>
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
                      width: "100px",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "12px",
                      whiteSpace: "nowrap"
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
                  Tip: Generate a random 6-character code or enter your own
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

      {/* Question Order Modal */}
      {showOrderModal && (
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
            width: "80%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>Reorder Questions</h3>
            
            <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
              <p style={{ margin: "0", fontSize: "14px", color: "#666" }}>
                <strong>Instructions:</strong> Use the Up/Down buttons to change question order in the game. 
                The first question will be "Game Q1", second will be "Game Q2", etc.
              </p>

               {/* Quick Sort Buttons */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button
                    onClick={quickSortAscending}
                    style={{
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Sort Ascending
                  </button>
                  <button
                    onClick={quickSortDescending}
                    style={{
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Sort Descending
                  </button>
                  <button
                    onClick={quickSortRandom}
                    style={{
                      backgroundColor: "#fd7e14",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      padding: "6px 12px",
                      fontSize: "12px",
                      cursor: "pointer"
                    }}
                  >
                    Random Shuffle
                  </button>
                </div>
            </div>

            {orderedQuestions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>No questions found in this collection.</p>
            ) : (
              <div style={{ marginBottom: "20px" }}>
                {orderedQuestions.map((q, index) => (
                  <div
                    key={q._id}
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #dee2e6",
                      padding: "12px",
                      marginBottom: "8px",
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px"
                    }}
                  >
                    <div style={{ 
                      backgroundColor: "#28a745", 
                      color: "white", 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      fontWeight: "bold",
                      minWidth: "60px",
                      textAlign: "center"
                    }}>
                      Game Q{index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        Original Q{q.number}
                      </div>
                      <div style={{ fontSize: "14px", color: "#666" }}>
                        {q.question.substring(0, 80)}...
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <button
                        onClick={() => moveQuestion(index, index - 1)}
                        disabled={index === 0}
                        style={{
                          backgroundColor: index === 0 ? "#ccc" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: index === 0 ? "not-allowed" : "pointer",
                          minWidth: "40px"
                        }}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveQuestion(index, index + 1)}
                        disabled={index === orderedQuestions.length - 1}
                        style={{
                          backgroundColor: index === orderedQuestions.length - 1 ? "#ccc" : "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: index === orderedQuestions.length - 1 ? "not-allowed" : "pointer",
                          minWidth: "40px"
                        }}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveOrder}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Save Order
              </button>
              <button
                onClick={closeOrderModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Settings Modal */}
      {showGameSettingsModal && (
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
            padding: "25px",
            borderRadius: "10px",
            width: "80%",
            maxWidth: "600px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <h3 style={{ marginBottom: "20px", textAlign: "center" }}>
              Game Settings - {selectedCollection?.name}
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                <input
                  type="checkbox"
                  checked={useGlobalSettings}
                  onChange={(e) => setUseGlobalSettings(e.target.checked)}
                />
                <span style={{ fontWeight: "bold" }}>Use Global Default Settings</span>
              </label>
              
              {globalSettings && (
                <div style={{ 
                  backgroundColor: "#f8f9fa", 
                  padding: "12px", 
                  borderRadius: "5px", 
                  marginBottom: "15px" 
                }}>
                  <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Global Defaults:</h4>
                  <div style={{ fontSize: "12px", color: "#666" }}>
                    <p style={{ margin: "2px 0" }}>• Game Mode: {globalSettings.defaultGameMode}</p>
                    <p style={{ margin: "2px 0" }}>• Wrong Answer: +{formatTime(globalSettings.defaultWrongAnswerPenalty)}</p>
                    <p style={{ margin: "2px 0" }}>• Hint: +{formatTime(globalSettings.defaultHintPenalty)}</p>
                    <p style={{ margin: "2px 0" }}>• Skip: +{formatTime(globalSettings.defaultSkipPenalty)}</p>
                  </div>
                </div>
              )}
            </div>

            {!useGlobalSettings && (
              <div style={{ marginBottom: "20px" }}>
                <h4 style={{ marginBottom: "15px", color: "#333" }}>Custom Settings:</h4>
                
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Game Mode:
                  </label>
                  <select
                    value={customSettings.gameMode}
                    onChange={(e) => setCustomSettings({...customSettings, gameMode: e.target.value})}
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "5px",
                      border: "1px solid #ccc"
                    }}
                  >
                    <option value="default">📋 Default (Follow Question Order)</option>
                    <option value="random">🎲 Random (Each Game Different)</option>
                    <option value="rotating">🔄 Rotating</option>
                    <option value="rotating-reverse">🔄 Rotating Reverse</option>
                  </select>
                  <p style={{ 
                    fontSize: "12px", 
                    color: "#666", 
                    margin: "5px 0 0 0",
                    fontStyle: "italic"
                  }}>
                    {customSettings.gameMode === 'random' && "🎲 Questions will be randomized differently for each player/game session"}
                    {customSettings.gameMode === 'default' && "📋 Questions follow the order you set in 'Order Questions'"}
                    {customSettings.gameMode === 'rotating' && "🔄 Questions rotate in sequence for different players"}
                    {customSettings.gameMode === 'rotating-reverse' && "🔄 Questions rotate in reverse sequence for different players"}
                  </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Wrong Answer Penalty: {formatTime(customSettings.wrongAnswerPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="600"
                    step="30"
                    value={customSettings.wrongAnswerPenalty}
                    onChange={(e) => setCustomSettings({...customSettings, wrongAnswerPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Hint Penalty: {formatTime(customSettings.hintPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="15"
                    value={customSettings.hintPenalty}
                    onChange={(e) => setCustomSettings({...customSettings, hintPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%" }}
                  />
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Skip Penalty: {formatTime(customSettings.skipPenalty)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1200"
                    step="60"
                    value={customSettings.skipPenalty}
                    onChange={(e) => setCustomSettings({...customSettings, skipPenalty: parseInt(e.target.value)})}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={handleSaveGameSettings}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6f42c1",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "bold"
                }}
              >
                Save Settings
              </button>
              <button
                onClick={closeGameSettingsModal}
                style={{
                  flex: 1,
                  padding: "12px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "16px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionsBank;