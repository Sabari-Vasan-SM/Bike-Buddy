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
      const res = await fetch("http://localhost:5000/api/auth/login", {
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

  return (
    <div className="login-container">
      <img
        src="https://cdn-icons-png.flaticon.com/128/8598/8598957.png" // you can change to your own image
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
