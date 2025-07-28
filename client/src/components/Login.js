"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("customer")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const showNotification = (message, type = "error") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify({ role: data.role, email: data.email }))
        showNotification("Login successful! Welcome back.", "success")

        setTimeout(() => {
          if (data.role === "owner") {
            navigate("/owner")
          } else {
            navigate("/customer")
          }
        }, 1000)
      } else {
        setError(data.message || "Invalid Credentials")
        showNotification(data.message || "Invalid Credentials", "error")
      }
    } catch (err) {
      console.error("Login error:", err)
      const errorMsg = "Network or server error. Please check your connection or try again later."
      setError(errorMsg)
      showNotification(errorMsg, "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Choose icon based on role
  const iconUrl =
    role === "owner"
      ? "https://cdn-icons-png.flaticon.com/128/8598/8598993.png"
      : "https://cdn-icons-png.flaticon.com/128/296/296210.png"

  return (
    <div className="login-container fade-in">
      <img src={iconUrl || "/placeholder.svg"} alt="User Icon" className="login-image" />
      <h2>Welcome Back</h2>
      <p className="subtitle">Sign in to your account</p>

      <form onSubmit={handleLogin}>
        <div className="role-switch">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="pill-select" disabled={isLoading}>
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </div>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="form-input"
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          className="form-input"
        />

        {error && (
          <div
            style={{
              color: "var(--error-color)",
              fontSize: "14px",
              textAlign: "center",
              padding: "8px",
              background: "rgba(239, 68, 68, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading} className={isLoading ? "loading-button" : ""}>
          {isLoading ? "" : "Sign In"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account? <a href="/register">Create one here</a>
        </p>
      </div>
    </div>
  )
}

export default Login
