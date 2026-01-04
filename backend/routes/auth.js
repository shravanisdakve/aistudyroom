const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// SIGNUP
router.post("/signup", async (req, res) => {
  const { displayName, email, university, password, role, primarySubject } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists)
    return res.status(400).json({ message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    displayName,
    email,
    university,
    password: hashedPassword,
    role: role || 'student',
    primarySubject
  });

  const token = jwt.sign(
    { id: newUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    message: "Signup successful",
    token,
    user: {
      id: newUser._id,
      displayName: newUser.displayName,
      email: newUser.email,
      university: newUser.university,
      role: newUser.role,
      primarySubject: newUser.primarySubject
    }
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // Return full user object (except password)
  res.json({
    token,
    user: {
      id: user._id,
      displayName: user.displayName,
      email: user.email,
      university: user.university,
      role: user.role,
      primarySubject: user.primarySubject
    }
  });
});

module.exports = router;