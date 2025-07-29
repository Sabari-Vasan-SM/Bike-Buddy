"use client"

// Import necessary modules and hooks
import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  // State variables for managing form inputs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const role = "customer" // Role is fixed as 'customer'
  const navigate = useNavigate()

  // Handle registration form submission
  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      // Send registration request to the server
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })
      const data = await res.json()
      if (res.ok) {
        // Show success notification and navigate to login page
        showNotification("Registration successful!", "success")
        setTimeout(() => navigate("/"), 2000) // Redirect after 2 seconds
      } else {
        // Show error notification if registration fails
        showNotification(data.message || "Registration failed", "error")
      }
    } catch (err) {
      // Handle network or server errors
      showNotification("Server error. Please try again later.", "error")
    }
  }

  // Function to display notifications
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  return (
    <div className="login-container">
      <h2>Welcome New Customer</h2>
      <form onSubmit={handleRegister}>
        {/* Input field for email */}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        
        {/* Input field for password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        {/* Submit button */}
        <button type="submit" variant="contained">
          Register
        </button>
      </form>
      
      {/* Link to login page for existing users */}
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  )
}

export default Register
