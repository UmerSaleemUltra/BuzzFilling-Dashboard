import express from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.js";

const router = express.Router();

// JWT Secret
const JWT_SECRET = "SMHAU171175";

// Max Admin Limit
const MAX_ADMIN_LIMIT = 4;

// Admin Signup Route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if the admin limit has been reached
    const adminCount = await Admin.countDocuments();
    if (adminCount >= MAX_ADMIN_LIMIT) {
      return res.status(400).json({ message: `Admin limit reached. Only ${MAX_ADMIN_LIMIT} admins are allowed.` });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists with this email." });
    }

    const newAdmin = new Admin({ firstName, lastName, email, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully." });
  } catch (error) {
    console.error("Error during admin signup:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Admin Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ message: "Login successful.", token });
  } catch (error) {
    console.error("Error during admin login:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// Protected Admin Route
router.get("/dashboard", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    res.status(200).json({ message: "Welcome to Admin Dashboard", admin });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(400).json({ message: "Invalid token." });
  }
});

export default router;
