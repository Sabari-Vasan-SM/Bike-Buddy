"use client"
import { useNavigate } from "react-router-dom"

const Navbar = () => {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/")
    window.location.reload()
  }

  return (
    <nav className="navbar">
      <div
        className="navbar-brand"
        onClick={() => (user ? navigate(user.role === "customer" ? "/customer" : "/owner") : navigate("/"))}
      >
        CartRabbit Bike Service !
      </div>

      {user && (
        <div className="nav-links">
          {user.role === "customer" && <span onClick={() => navigate("/customer")}>Dashboard</span>}
          {user.role === "owner" && <span onClick={() => navigate("/owner")}>Owner Panel</span>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar
