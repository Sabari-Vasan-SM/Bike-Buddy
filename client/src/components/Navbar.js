"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/")
    window.location.reload()
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={() => (user ? navigate(user.role === "customer" ? "/customer" : "/owner") : navigate("/"))}
      >
        CartRabbit Bike Service 🚴‍♂️
      </div>

      <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
        ☰
      </button>

      {user && (
        <div className={`nav-links ${isMobileMenuOpen ? "active" : ""}`}>
          {user.role === "customer" && (
            <>
              <span
                onClick={() => {
                  navigate("/customer")
                  setIsMobileMenuOpen(false)
                }}
              >
                Dashboard
              </span>
              <span
                onClick={() => {
                  navigate("/customer/book-service")
                  setIsMobileMenuOpen(false)
                }}
              >
                Book Service
              </span>
              <span
                onClick={() => {
                  navigate("/customer/service-history")
                  setIsMobileMenuOpen(false)
                }}
              >
                History
              </span>
            </>
          )}
          {user.role === "owner" && (
            <>
              <span
                onClick={() => {
                  navigate("/owner")
                  setIsMobileMenuOpen(false)
                }}
              >
                Dashboard
              </span>
              <span
                onClick={() => {
                  navigate("/owner/services")
                  setIsMobileMenuOpen(false)
                }}
              >
                Services
              </span>
              <span
                onClick={() => {
                  navigate("/owner/bookings")
                  setIsMobileMenuOpen(false)
                }}
              >
                Bookings
              </span>
            </>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
