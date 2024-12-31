import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import validator from "validator";

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { businessName, state, firstName, lastName, email, password } = req.body;

  if (!businessName || !state || !firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ businessName, state, firstName, lastName, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const JWT_SECRET = "SMHAU171175";
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful.", token, expiresIn: "1h" });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get All Users Route
router.get("/users", async (req, res) => {
  try {
    // Retrieve all users, selecting fields including createdAt
    const users = await User.find({}, 'firstName lastName businessName email state createdAt');

    // Check if there are any users
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found." });
    }

    // Return the list of users
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Delete Account Route
router.delete("/delete", async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // Find the user by their ID and delete
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error during account deletion:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }

  router.patch("/update", async (req, res) => {
    try {
      const { userId, updatedData } = req.body;
  
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Optionally hash password if it's being updated
      if (updatedData.password) {
        updatedData.password = await bcrypt.hash(updatedData.password, 12); // Example of hashing
      }
  
      // Update the user data
      Object.assign(user, updatedData); // Merges updatedData into the user object
  
      // Save the updated user
      await user.save();
  
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error });
    }
  });
});

export default router;
