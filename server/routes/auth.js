const express = require("express")
const router = express.Router()
const User = require("../models/User")
const bcrypt = require("bcryptjs")

// Register
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" })
  }
  try {
    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    user = new User({ email, password: hashedPassword, role, name: email })
    await user.save()
    res.status(201).json({ email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// Login
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body
  if (!email || !password || !role) {
    return res.status(400).json({ message: "All fields are required" })
  }
  try {
    const user = await User.findOne({ email, role })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }
    res.json({ email: user.email, role: user.role })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
