import express from "express";
import Admin from "../models/admindb.mjs";  // Importing the Admin model
import mongoose from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();
const JWT_SECRET = "your_secret_key"; // Replace with your actual secret key

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

// Get a list of all admins (protected route)
router.get("/", authenticateJWT, async (req, res) => {
    try {
        let results = await Admin.find({});
        res.status(200).json({ message: "Records retrieved successfully", data: results });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get a single admin by ID (protected route)
router.get("/:id", authenticateJWT, async (req, res) => {
    try {
        let result = await Admin.findById(req.params.id);
        if (!result) {
            return res.status(404).json({ message: "Not found" });
        }
        res.status(200).json({ message: "Record found", data: result });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Register a new admin
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        let existingUser = await Admin.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newAdmin = new Admin({
            username,
            password: hashedPassword,
            role: "admin"
        });

        let result = await newAdmin.save();
        res.status(201).json({ message: "Admin registered successfully", userId: result._id });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Login route with JWT generation and logging
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    
    try {
        let user = await Admin.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, username: user.username, role: "admin" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, username: user.username }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Logout route with logging
router.post("/logout", authenticateJWT, async (req, res) => {
    res.status(200).json({ message: "Logged out successfully" });
});

export default router;
