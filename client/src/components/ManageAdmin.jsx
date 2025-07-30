import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./MainStyles.css";

const ManageAdmin = () => {
    const [admins, setAdmins] = useState([]);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState("");
    const [isMain, setIsMain] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");

    useEffect(() => {
        if (!token) return navigate("/login");

        const decoded = jwtDecode(token);
        setIsMain(decoded.role === "main");
        setUserId(decoded.id);
        fetchAdmins();
    }, [navigate]);

    const fetchAdmins = async () => {
        try {
            const res = await fetch("http://localhost:5000/admins/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setAdmins(data.data.filter((a) => a.role === "admin"));
            } else {
                alert(data.message || "Failed to load admins");
            }
        } catch (err) {
            alert("Error loading admins");
        }
    };

    const addAdmin = async () => {
        if (!newUsername || !newPassword) return alert("Fields cannot be empty");

        setLoading(true);
        const res = await fetch("http://localhost:5000/admins/register", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username: newUsername, password: newPassword }),
        });
        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            setNewUsername("");
            setNewPassword("");
            fetchAdmins();
        } else {
            alert(data.message);
        }
    };

    const deleteAdmin = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        const res = await fetch(`http://localhost:5000/admins/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
            fetchAdmins();
        } else {
            alert(data.message);
        }
    };

    const transferRole = async (id) => {
        if (!window.confirm("Transfer main admin role to this user?")) return;
        const res = await fetch(`http://localhost:5000/admins/transfer-role/${id}`, {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
            alert("Role transferred. Please log in again.");
            localStorage.removeItem("jwtToken");
            navigate("/login");
        } else {
            alert(data.message);
        }
    };

    useEffect(() => {
  if (!token) return navigate("/login");

  try {
    const decoded = jwtDecode(token);
    setUserId(decoded.id);

    if (decoded.role !== "main") {
      if (!sessionStorage.getItem("alertShown")) {
        alert("Access denied. Only the main admin can manage admins.");
        sessionStorage.setItem("alertShown", "true");
      }
      navigate("/admin");
      return; 
    }

    setIsMain(true);
    fetchAdmins();
  } catch (err) {
    console.error("Invalid token");
    navigate("/login");
  }
}, [navigate]);


    return (
        <div className="login-container">
            <img src="/images/changihome.jpg" alt="Background" className="background-image" />
            <div className="page-overlay"></div>

            <div className="top-left-logo">
                <img src="/images/ces.jpg" alt="Changi Experience Studio" />
            </div>

            <div className="buttons">
                <h1 style={{ color: "#000", fontSize: "28px", textAlign: "center", marginBottom: "20px" }}>
                    Manage Admins
                </h1>

                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <input
                        type="text"
                        placeholder="New admin username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={inputStyle}
                    />
                    <button className="login-btn" style={btnStyle("#28a745")} onClick={addAdmin} disabled={loading}>
                        {loading ? "Adding..." : "Add Admin"}
                    </button>
                </div>

                <div>
                    <h3 style={{ color: "#000", textAlign: "center", marginBottom: "12px" }}>All Admins</h3>
                    <ul style={{ padding: 0, listStyleType: "none", textAlign: "center" }}>
                        {admins.map((admin) => (
                            <li key={admin._id} style={{ marginBottom: "12px" }}>
                                <strong>{admin.username}</strong>
                                <button className="login-btn" style={btnStyle("#dc3545")} onClick={() => deleteAdmin(admin._id)}>
                                    Remove
                                </button>
                                <button className="login-btn" style={btnStyle("#007bff")} onClick={() => transferRole(admin._id)}>
                                    Transfer Role
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// Reuse styles
const inputStyle = {
    marginRight: "8px",
    padding: "8px",
    borderRadius: "8px",
    border: "1px solid #ccc",
};

const btnStyle = (bgColor) => ({
    marginLeft: "10px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: bgColor,
    color: "#fff",
    cursor: "pointer",
});

export default ManageAdmin;
