"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import {
  Dashboard as DashboardIcon,
  CalendarToday as CalendarIcon,
  History as HistoryIcon,
  SupportAgent as SupportIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Build as BuildIcon,
} from "@mui/icons-material"

// eslint-disable-next-line no-unused-vars
function CustomerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0,
    pendingBookings: 0,
    completedBookings: 0,
    favoriteService: "N/A",
    avgServiceTime: 0,
  })
  const [showAllServices, setShowAllServices] = useState(false)

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/")
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch(`https://cartrabbit-6qz5.onrender.com/api/bookings?email=${user.email}`),
            fetch("https://cartrabbit-6qz5.onrender.com/api/services"),
          ])
          const bookingsData = await bookingsRes.json()
          const servicesData = await servicesRes.json()

          setBookings(bookingsData)
          setServices(servicesData)

          // Calculate comprehensive stats
          const totalSpent = bookingsData.reduce((sum, booking) => {
            return sum + (booking.serviceDetails?.price || 0)
          }, 0) // Provide an initial value of 0 to handle empty arrays

          const completedBookings = bookingsData.filter((b) => b.status === "Completed").length
          const pendingBookings = bookingsData.filter((b) => b.status === "Pending").length

          // Find most booked service
          const serviceCount = {}
          bookingsData.forEach((booking) => {
            serviceCount[booking.service] = (serviceCount[booking.service] || 0) + 1
          })
          const favoriteService =
            Object.keys(serviceCount).reduce((a, b) => (serviceCount[a] > serviceCount[b] ? a : b), "") || "N/A" // Provide an initial value of "" to handle empty arrays

          // Calculate average service time
          const avgServiceTime =
            bookingsData.length > 0
              ? bookingsData.reduce((sum, booking) => sum + (booking.serviceDetails?.duration || 0), 0) /
                bookingsData.length
              : 0

          setStats({
            totalBookings: bookingsData.length,
            totalSpent,
            pendingBookings,
            completedBookings,
            favoriteService,
            avgServiceTime: Math.round(avgServiceTime * 10) / 10,
          })
        } catch (err) {
          console.error("Failed to load data:", err)
          setBookings([])
          setServices([])
          showNotification("Failed to load data. Please refresh the page.", "error")
        } finally {
          setTimeout(() => {
            setIsLoading(false)
          }, 500) // Reduced timeout duration to 0.5 seconds
        }
      }
      loadData()
    }
  }, [navigate, user])

  if (isLoading) {
    return <LoadingScreen type="customer" />
  }

  const recentBookings = bookings.slice(0, 4)
  const upcomingBookings = bookings.filter((b) => b.status === "Pending" || b.status === "In Progress").slice(0, 3)

  return (
    <div className="modern-customer-dashboard">
      {/* Hero Section */}
      <div className="customer-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome back, {user?.email.split("@")[0]}! 🚴‍♂️</h1>
            <p className="hero-subtitle">Your trusted partner for professional bike services and maintenance</p>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn primary" onClick={() => navigate("/customer/book-service")}>
              <CalendarIcon />
              <span>Book Service</span>
            </button>
            <button className="quick-action-btn secondary" onClick={() => navigate("/customer/service-history")}>
              <HistoryIcon />
              <span>Service History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-section">
        <h2 className="section-title">
          <DashboardIcon />
          Your Service Overview
        </h2>
        <div className="stats-grid">
          <div className="stat-card total-spent">
            <div className="stat-icon">
              <MoneyIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">₹{stats.totalSpent}</div>
              <div className="stat-label">Total Spent</div>
            </div>
          </div>
          <div className="stat-card total-services">
            <div className="stat-icon">
              <BuildIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalBookings}</div>
              <div className="stat-label">Services Booked</div>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">
              <CheckCircleIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completedBookings}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <ScheduleIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingBookings}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Upcoming Services */}
      <div className="activity-section">
        <div className="dashboard-card recent-bookings">
          <h3 className="card-title">
            <HistoryIcon />
            Recent Bookings
          </h3>
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No recent bookings</p>
              <button className="empty-action-btn" onClick={() => navigate("/customer/book-service")}>
                Book Your First Service
              </button>
            </div>
          ) : (
            <div className="bookings-timeline">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="timeline-item">
                  <div className={`timeline-dot status-${booking.status.toLowerCase().replace(/\s/g, "")}`}></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4 className="service-name">{booking.service}</h4>
                      <span className={`status-badge status-${booking.status.toLowerCase().replace(/\s/g, "")}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="timeline-details">
                      <span className="booking-date">📅 {booking.bookingDate}</span>
                      <span className="booking-price">💰 ₹{booking.serviceDetails?.price || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="view-all-btn" onClick={() => navigate("/customer/service-history")}>
            View All History
          </button>
        </div>

        <div className="dashboard-card upcoming-services">
          <h3 className="card-title">
            <ScheduleIcon />
            Upcoming & In Progress
          </h3>
          {upcomingBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔧</div>
              <p>No upcoming services</p>
              <button className="empty-action-btn" onClick={() => navigate("/customer/book-service")}>
                Schedule Service
              </button>
            </div>
          ) : (
            <div className="upcoming-list">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="upcoming-item">
                  <div className="upcoming-icon">{booking.status === "Pending" ? "⏳" : "🔧"}</div>
                  <div className="upcoming-details">
                    <div className="upcoming-service">{booking.service}</div>
                    <div className="upcoming-date">{booking.bookingDate}</div>
                    <div className={`upcoming-status status-${booking.status.toLowerCase().replace(/\s/g, "")}`}>
                      {booking.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Service Categories */}
      <div className="services-section">
        <div className="dashboard-card available-services">
          <h3 className="card-title">
            <BuildIcon />
            Available Services
          </h3>
          <div className="services-grid">
            {services.slice(0, 3).map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <h4 className="service-title">{service.name}</h4>
                  <div className="service-price">₹{service.price}</div>
                </div>
                <div className="service-details">
                  <div className="service-duration">⏱️ {service.duration}h</div>
                  {service.description && <p className="service-description">{service.description}</p>}
                </div>
                <button
                  className="book-service-btn"
                  onClick={() => navigate("/customer/book-service", { state: { selectedService: service.name } })}
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
          <button className="view-more-btn" onClick={() => setShowAllServices(true)}>
            View More
          </button>
        </div>

        {showAllServices && (
          <div className="services-dialog">
            <div className="dialog-overlay" onClick={() => setShowAllServices(false)}></div>
            <div className="dialog-content">
              <h3>All Services</h3>
              <div className="services-grid">
                {services.map((service) => (
                  <div key={service._id} className="service-card">
                    <div className="service-header">
                      <h4 className="service-title">{service.name}</h4>
                      <div className="service-price">₹{service.price}</div>
                    </div>
                    <div className="service-details">
                      <div className="service-duration">⏱️ {service.duration}h</div>
                      {service.description && <p className="service-description">{service.description}</p>}
                    </div>
                    <button
                      className="book-service-btn"
                      onClick={() => navigate("/customer/book-service", { state: { selectedService: service.name } })}
                    >
                      Book Now
                    </button>
                  </div>
                ))}
              </div>
              <button className="close-dialog-btn" onClick={() => setShowAllServices(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Support & Help Section */}
      <div className="support-section">
        <div className="dashboard-card support-card">
          <h3 className="card-title">
            <SupportIcon />
            Need Help?
          </h3>
          <div className="support-content">
            <div className="support-grid">
              <div className="support-item">
                <div className="support-icon">📞</div>
                <div className="support-details">
                  <h4>Call Us</h4>
                  <p>+1 (555) 123-4567</p>
                  <span className="support-hours">Mon-Fri 9AM-6PM</span>
                </div>
              </div>
              <div className="support-item">
                <div className="support-icon">📧</div>
                <div className="support-details">
                  <h4>Email Support</h4>
                  <p>support@cartrabbit.com</p>
                  <span className="support-hours">24/7 Response</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
