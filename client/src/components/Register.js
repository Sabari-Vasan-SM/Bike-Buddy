"use client"

// src/components/Register.js
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const role = "customer"
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (res.ok) {
        alert("Registration successful!")
        navigate("/")
      } else {
        alert(data.message || "Registration failed")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
    }
  }

  return (
    <div className="login-container">
      <h2>Welcome New Customer</h2>
      <form onSubmit={handleRegister}>
        {/* Role is always 'customer' now, dropdown removed */}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" variant="contained">
          Register
        </button>
      </form>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  )
}

export default Register
