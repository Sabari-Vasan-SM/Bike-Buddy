import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import CustomerDashboard from "./components/customer/CustomerDashboard"
import BookService from "./components/customer/BookService"
import ServiceHistory from "./components/customer/ServiceHistory"
import OwnerDashboard from "./components/owner/OwnerDashboard"
import ServicesManagement from "./components/owner/ServicesManagement"
import BookingsManagement from "./components/owner/BookingsManagement"
import Navbar from "./components/Navbar"
import "./styles/Login.css"
import "./styles/CustomerDashboard.css"
import "./styles/Navbar.css"
import "./styles/OwnerDashboard.css"
import "./styles/App.css"

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
        <Route path="/customer/book-service" element={<ProtectedRoute element={BookService} role="customer" />} />
        <Route path="/customer/service-history" element={<ProtectedRoute element={ServiceHistory} role="customer" />} />
        <Route path="/owner" element={<ProtectedRoute element={OwnerDashboard} role="owner" />} />
        <Route path="/owner/services" element={<ProtectedRoute element={ServicesManagement} role="owner" />} />
        <Route path="/owner/bookings" element={<ProtectedRoute element={BookingsManagement} role="owner" />} />
      </Routes>
    </Router>
  )
}

export default App
