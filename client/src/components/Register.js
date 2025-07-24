"use client"

// src/components/Register.js
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("customer")
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
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
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{ marginBottom: "1rem", width: "100%", padding: "0.5rem" }}
        >
          <option value="customer">Customer</option>
          {/* <option value="owner">Owner</option>
          <option value="admin">Admin</option> */}
        </select>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  )
}

export default Register
