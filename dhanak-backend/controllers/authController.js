import User from "../models/User.js"
import bcrypt from "bcryptjs"

// SIGNUP
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ error: "User already exists" })

    // Hash password
    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({ name, email, password: hashed })
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, specialization: user.specialization, profileImage: user.profileImage })
  } catch (err) {
    console.error("Signup error:", err)
    res.status(500).json({ error: "Signup failed" })
  }
}

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: "Invalid credentials" })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ error: "Invalid credentials" })

    res.json({ _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address, specialization: user.specialization, profileImage: user.profileImage })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ error: "Login failed" })
  }
}
