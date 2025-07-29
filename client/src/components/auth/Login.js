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

        // Show loading animation for 1.5s, then navigate
        setTimeout(() => {
          if (data.role === "owner") {
            navigate("/owner")
          } else {
            navigate("/customer")
          }
        }, 1500)
      } else {
        setError(data.message || "Invalid Credentials")
        showNotification(data.message || "Invalid Credentials", "error")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      const errorMsg = "Network or server error. Please check your connection or try again later."
      setError(errorMsg)
      showNotification(errorMsg, "error")
      setIsLoading(false)
    }
    // Don't set isLoading to false here, let it be handled after navigation
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

      {isLoading ? (
        <div className="loading-animation" style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "40px 0" }}>
          <img
          
            src={
              role === "owner"
                ? "https://camo.githubusercontent.com/28667441bb9b0c4974a990d44cb4eeee21ab8169ea16bb9cd5de528081323383/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f6a534b426d4b6b766f3264505151747352312f67697068792e676966"
                : "https://i.pinimg.com/originals/22/94/62/2294623e26b0d9dc73e8d7612792b819.gif"
            }
            alt="Loading"
            style={{ width: 180, height: 180, marginBottom: 24 }}
          />
          <div style={{ fontWeight: 500, fontSize: 18, color: "#333" }}>Loading your dashboard...</div>
        </div>
      ) : (
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
            Sign In
          </button>
        </form>
      )}

      {role === "customer" && !isLoading && (
        <div className="login-footer">
          <p>
            Don't have an account? <a href="/register">Create one here</a>
          </p>
        </div>
      )}
    </div>
  )
}

export default Login
