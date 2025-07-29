"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material"

function OwnerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
  })

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
    if (!user || user.role !== "owner") {
      navigate("/")
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch("https://cartrabbit-6qz5.onrender.com/api/bookings"),
            fetch("https://cartrabbit-6qz5.onrender.com/api/services"),
          ])
          const bookingsData = await bookingsRes.json()
          const servicesData = await servicesRes.json()

          setBookings(bookingsData)
          setServices(servicesData)

          // Calculate stats
          const totalRevenue = bookingsData.reduce((sum, booking) => {
            return sum + (booking.serviceDetails?.price || 0)
          }, 0)

          const today = new Date().toDateString()
          const todayBookings = bookingsData.filter((booking) => {
            const bookingDate = new Date(booking.createdAt).toDateString()
            return bookingDate === today
          }).length

          setStats({
            totalServices: servicesData.length,
            totalBookings: bookingsData.length,
            pendingBookings: bookingsData.filter((b) => b.status === "Pending").length,
            completedBookings: bookingsData.filter((b) => b.status === "Completed").length,
            totalRevenue,
            todayBookings,
          })
        } catch (err) {
          console.error("Failed to load data:", err)
          setBookings([])
          setServices([])
          showNotification("Failed to load data. Please refresh the page.", "error")
        } finally {
          setTimeout(() => {
            setIsLoading(false)
          }, 2000)
        }
      }
      loadData()
    }
  }, [navigate, user])

  if (isLoading) {
    return <LoadingScreen type="owner" />
  }

  const recentBookings = bookings.slice(0, 5)

  return (
    <div className="modern-owner-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome back, Workshop Manager! 👨‍🔧</h1>
            <p className="hero-subtitle">Manage your bike service business with ease and efficiency</p>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn primary" onClick={() => navigate("/owner/services")}>
              <BuildIcon />
              <span>Manage Services</span>
            </button>
            <button className="quick-action-btn secondary" onClick={() => navigate("/owner/bookings")}>
              <AssignmentIcon />
              <span>View Bookings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-section">
        <h2 className="section-title">
          <DashboardIcon />
          Business Overview
        </h2>
        <div className="stats-grid">
          <div className="stat-card revenue">
            <div className="stat-icon">
              <MoneyIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">${stats.totalRevenue}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card bookings">
            <div className="stat-icon">
              <AssignmentIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card services">
            <div className="stat-icon">
              <BuildIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalServices}</div>
              <div className="stat-label">Active Services</div>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <ScheduleIcon />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pendingBookings}</div>
              <div className="stat-label">Pending Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="dashboard-card quick-stats">
          <h3 className="card-title">
            <TrendingIcon />
            Today's Performance
          </h3>
          <div className="quick-stats-content">
            <div className="quick-stat">
              <span className="quick-stat-number">{stats.todayBookings}</span>
              <span className="quick-stat-label">New Bookings Today</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat-number">{stats.completedBookings}</span>
              <span className="quick-stat-label">Completed Services</span>
            </div>
            <div className="progress-indicator">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%`,
                  }}
                ></div>
              </div>
              <span className="progress-text">
                {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                Completion Rate
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <h3 className="card-title">
            <AssignmentIcon />
            Recent Bookings
          </h3>
          {recentBookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No recent bookings</p>
            </div>
          ) : (
            <div className="activity-list">
              {recentBookings.map((booking) => (
                <div key={booking._id} className="activity-item">
                  <div className="activity-avatar">
                    {booking.name ? booking.name.charAt(0).toUpperCase() : booking.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="activity-details">
                    <div className="activity-title">{booking.service}</div>
                    <div className="activity-subtitle">
                      {booking.name || booking.email} • ${booking.serviceDetails?.price || 0}
                    </div>
                  </div>
                  <div className={`activity-status status-${booking.status.toLowerCase().replace(/\s/g, "")}`}>
                    {booking.status}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button className="view-all-btn" onClick={() => navigate("/owner/bookings")}>
            View All Bookings
          </button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="action-cards">
        <div className="action-card" onClick={() => navigate("/owner/services")}>
          <div className="action-icon">
            <BuildIcon />
          </div>
          <div className="action-content">
            <h3>Service Management</h3>
            <p>Add, edit, or remove bike services. Set pricing and duration for each service type.</p>
            <div className="action-arrow">→</div>
          </div>
        </div>

        <div className="action-card" onClick={() => navigate("/owner/bookings")}>
          <div className="action-icon">
            <AssignmentIcon />
          </div>
          <div className="action-content">
            <h3>Booking Management</h3>
            <p>View all customer bookings, update service status, and manage your workshop queue.</p>
            <div className="action-arrow">→</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
