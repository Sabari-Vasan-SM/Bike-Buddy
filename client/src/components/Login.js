"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("customer")
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`https://cartrabbit-1-p9a2.onrender.com/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify({ role: data.role, email: data.email }))
        if (data.role === "owner") {
          navigate("/owner")
        } else {
          navigate("/customer")
        }
      } else {
        alert(data.message || "Invalid Credentials")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
    }
  }

  // Choose icon based on role
  const iconUrl = role === "owner"
    ? "https://cdn-icons-png.flaticon.com/128/8598/8598993.png"
    : "https://cdn-icons-png.flaticon.com/128/296/296210.png"

  return (
    <div className="login-container">
      <img
        src={iconUrl}
        alt="User Icon"
        className="login-image"
      />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="role-switch">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="pill-select">
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" variant="contained">
          Login
        </button>
      </form>
      <p>
        Don't have an account? <a href="/register">Register here</a>
      </p>
    </div>
  )
}

export default Login
