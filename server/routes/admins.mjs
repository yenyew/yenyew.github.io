import express from "express";
import Admin from "../models/admindb.mjs";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const JWT_SECRET = "your_secret_key";

// JWT middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// GET all admins (main only)
router.get("/", authenticateJWT, async (req, res) => {
  if (req.user.role !== "main")
    return res.status(403).json({ message: "Only main admin can view admins" });

  try {
    const results = await Admin.find({});
    res.status(200).json({ message: "Records retrieved successfully", data: results });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET admin by ID
router.get("/:id", authenticateJWT, async (req, res) => {
  try {
    const result = await Admin.findById(req.params.id);
    if (!result) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Record found", data: result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/register", authenticateJWT, async (req, res) => {
  if (req.user.role !== "main")
    return res.status(403).json({ message: "Only main admin can add admins" });

  const { username, email, password } = req.body;

  // Simple email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const existing = await Admin.findOne({ username });
    if (existing) return res.status(400).json({ message: "Username already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, email, password: hashedPassword, role: "admin" });
    const result = await newAdmin.save();

    res.status(201).json({ message: "Admin registered", userId: result._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// DELETE admin (main only)
router.delete("/:id", authenticateJWT, async (req, res) => {
  if (req.user.role !== "main")
    return res.status(403).json({ message: "Only main admin can delete admins" });

  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting admin", error: error.message });
  }
});

// TRANSFER ROLE to another admin (main only)
router.patch("/transfer-role/:id", authenticateJWT, async (req, res) => {
  if (req.user.role !== "main")
    return res.status(403).json({ message: "Only main admin can transfer role" });

  try {
    await Admin.findByIdAndUpdate(req.user.id, { role: "admin" }); // demote self
    await Admin.findByIdAndUpdate(req.params.id, { role: "main" }); // promote new main
    res.status(200).json({ message: "Role transferred successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error transferring role", error: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await Admin.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// LOGOUT
router.post("/logout", authenticateJWT, async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

// REQUEST PASSWORD RESET
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const admin = await Admin.findOne({ email: { $regex: new RegExp(`^${email}$`, "i") } });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "15m" });

    admin.resetToken = token;
    admin.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
    await admin.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"CES Admin Portal" <${process.env.EMAIL_USER}>`,
      to: admin.email, 
      subject: "Reset your CES Admin password",
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Reset link sent to email." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
});


// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findOne({ _id: decoded.id, resetToken: token });

    if (!admin || admin.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ message: "Token expired or invalid" });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.resetToken = null;
    admin.resetTokenExpiry = null;
    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token", error: error.message });
  }
});


export default router;
