import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import CustomerDashboard from "./components/customer/CustomerDashboard"
import OwnerDashboard from "./components/owner/OwnerDashboard"
import Navbar from "./components/Navbar"
import "./styles/Login.css"
import "./styles/CustomerDashboard.css"
import "./styles/Navbar.css"
import "./styles/OwnerDashboard.css"; // Importing OwnerDashboard specific styles
import "./styles/App.css" // Ensure App.css is imported for global styles

// Protected Route Component
const ProtectedRoute = ({ element: Element, role }) => {
  const user = JSON.parse(localStorage.getItem("user"))

  if (!user) {
    return <Navigate to="/" replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "customer" ? "/customer" : "/owner"} replace />
  }

  return <Element />
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer" element={<ProtectedRoute element={CustomerDashboard} role="customer" />} />
        <Route path="/owner" element={<ProtectedRoute element={OwnerDashboard} role="owner" />} />
      </Routes>
    </Router>
  )
}

export default App
