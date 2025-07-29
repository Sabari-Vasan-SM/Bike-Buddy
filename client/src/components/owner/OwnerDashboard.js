"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Typography, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material"
import {
  Dashboard as DashboardIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  GetApp as ExportIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
// Removed incorrect import and usage of 'cors' and 'app'

function OwnerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [services, setServices] = useState([])
  const [filter, setFilter] = useState("all")
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  })
  const [editingService, setEditingService] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

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
        } catch (err) {
          console.error("Failed to load data:", err)
          setBookings([])
          setServices([])
          showNotification("Failed to load data. Please refresh the page.", "error")
        } finally {
          setIsLoading(false)
        }
      }
      loadData()
    }
  }, [navigate, user])

  const handleStatusChange = async (id, newStatus, customerEmail, serviceName, bookingDate, customerMobile) => {
    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setBookings((bookings) => bookings.map((b) => (b._id === id ? { ...b, status: newStatus } : b)))
        showNotification(`Booking status updated to ${newStatus}`, "success")
      } else {
        showNotification("Failed to update booking status", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      showNotification("Please fill all required service fields", "warning")
      return
    }
    try {
      const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (res.ok) {
        const created = await res.json()
        setServices((prev) => [...prev, created])
        setNewService({ name: "", price: "", duration: "", description: "" })
        showNotification("Service added successfully!", "success")
      } else {
        const errorText = await res.text()
        showNotification("Failed to add service: " + errorText, "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleUpdateService = async () => {
    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/services/${editingService._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      })
      if (res.ok) {
        const updated = await res.json()
        setServices(services.map((s) => (s._id === updated._id ? updated : s)))
        setEditingService(null)
        showNotification("Service updated successfully!", "success")
      } else {
        showNotification("Failed to update service", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/services/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setServices(services.filter((s) => s._id !== id))
          showNotification("Service deleted successfully!", "success")
        } else {
          showNotification("Failed to delete service", "error")
        }
      } catch (err) {
        showNotification("Server error. Please try again later.", "error")
      }
    }
  }

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      try {
        const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/bookings/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setBookings(bookings.filter((b) => b._id !== id))
          setSelectedBooking(null)
          showNotification("Booking deleted successfully!", "success")
        } else {
          showNotification("Failed to delete booking", "error")
        }
      } catch (err) {
        showNotification("Server error. Please try again later.", "error")
      }
    }
  }

  const exportBookings = () => {
    const csvContent = [
      ["Customer", "Service", "Date", "Status", "Phone", "Email"].join(","),
      ...filteredBookings.map((b) =>
        [b.name, b.service, b.bookingDate || b.date, b.status, b.phone, b.email].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    showNotification("Bookings exported successfully!", "success")
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = filter === "all" || b.status === filter
    const matchesSearch =
      searchTerm === "" ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking)
  }

  const handleCloseDetails = () => {
    setSelectedBooking(null)
  }

  // Dashboard Overview Data
  const totalServices = services.length
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length
  const completedBookings = bookings.filter((b) => b.status === "Completed").length

  if (isLoading) {
    return (
      <div className="owner-dashboard-container">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="loading"></div>
          <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="owner-dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Owner Dashboard</h1>
        <p className="dashboard-subtitle">Manage services and bookings efficiently</p>
      </div>

      {/* Dashboard Overview */}
      <div className="dashboard-overview-card">
        <h2 className="overview-title">
          <DashboardIcon /> Dashboard Overview
        </h2>
        <div className="overview-grid">
          <div className="overview-item">
            <span className="overview-number">{totalServices}</span>
            <span className="overview-label">Total Services</span>
          </div>
          <div className="overview-item">
            <span className="overview-number">{totalBookings}</span>
            <span className="overview-label">Total Bookings</span>
          </div>
          <div className="overview-item">
            <span className="overview-number">{pendingBookings}</span>
            <span className="overview-label">Pending Bookings</span>
          </div>
          <div className="overview-item">
            <span className="overview-number">{completedBookings}</span>
            <span className="overview-label">Completed</span>
          </div>
        </div>
      </div>

      <div className="owner-dashboard-grid">
        <div>
          {/* Manage Services */}
          <div className="section-card">
            <h2 className="section-title">
              <BuildIcon /> Manage Services
            </h2>

            <div className="service-form-fields">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Service Name</label>
                  <input
                    className="form-input"
                    placeholder="Enter service name"
                    value={editingService ? editingService.name : newService.name}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, name: e.target.value })
                        : setNewService({ ...newService, name: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0.00"
                    value={editingService ? editingService.price : newService.price}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, price: e.target.value })
                        : setNewService({ ...newService, price: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Duration (hours)</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={editingService ? editingService.duration : newService.duration}
                    onChange={(e) =>
                      editingService
                        ? setEditingService({ ...editingService, duration: e.target.value })
                        : setNewService({ ...newService, duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter service description"
                  value={editingService ? editingService.description : newService.description}
                  onChange={(e) =>
                    editingService
                      ? setEditingService({ ...editingService, description: e.target.value })
                      : setNewService({ ...newService, description: e.target.value })
                  }
                />
              </div>

              {editingService ? (
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleUpdateService}>
                    <EditIcon /> Update Service
                  </button>
                  <button className="btn-secondary" onClick={() => setEditingService(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn-primary" onClick={handleAddService}>
                  <AddIcon /> Add New Service
                </button>
              )}
            </div>
          </div>

          {/* Services List */}
          <div className="section-card">
            <h3 className="section-title">Services List</h3>
            {services.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔧</div>
                <h3 className="empty-title">No services added yet</h3>
                <p className="empty-subtitle">Add your first service above</p>
              </div>
            ) : (
              <div className="services-list">
                {services.map((service) => (
                  <div key={service._id} className="service-card">
                    <div className="service-card-content">
                      <div className="service-info">
                        <h3>{service.name}</h3>
                        <p className="service-meta">
                          ${service.price} • {service.duration} hrs
                        </p>
                        {service.description && <p className="service-description">{service.description}</p>}
                      </div>
                      <div className="service-card-actions">
                        <button className="btn-small btn-edit" onClick={() => setEditingService(service)}>
                          <EditIcon /> Edit
                        </button>
                        <button className="btn-small btn-delete" onClick={() => handleDeleteService(service._id)}>
                          <DeleteIcon /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Bookings */}
          <div className="section-card">
            <div className="bookings-header">
              <h2 className="section-title">
                <AssignmentIcon /> Bookings Management
              </h2>
              <div className="bookings-controls">
                <button className="export-btn" onClick={exportBookings}>
                  <ExportIcon /> Export CSV
                </button>
              </div>
            </div>

            <div className="bookings-controls">
              <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Bookings</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Completed">Completed</option>
              </select>

              <input
                className="search-input"
                placeholder="Search by email, name, or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {filteredBookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3 className="empty-title">No bookings found</h3>
                <p className="empty-subtitle">No bookings match your current filter/search</p>
              </div>
            ) : (
              <div className="bookings-list">
                {filteredBookings.map((booking) => (
                  <div key={booking._id} className={`booking-card status-${booking.status.replace(/\s/g, "")}`}>
                    <div className="booking-card-content">
                      <div className="booking-card-header">
                        <h3 className="booking-customer">{booking.email}</h3>
                        <span className={`status-badge status-${booking.status.toLowerCase().replace(/\s/g, "")}`}>
                          {booking.status}
                        </span>
                      </div>
                      <h4 className="booking-service">{booking.service}</h4>
                      <div className="booking-meta">
                        <span>📅 Booked: {booking.timestamp}</span>
                        <span>🗓️ Service: {booking.bookingDate || booking.date}</span>
                        <span>💰 ${booking.serviceDetails?.price || "0"}</span>
                      </div>
                      <div className="booking-card-actions">
                        <div className="booking-actions-left">
                          <button className="btn-small btn-edit" onClick={() => handleViewBookingDetails(booking)}>
                            View Details
                          </button>
                          <select
                            className="status-select"
                            value={booking.status}
                            onChange={(e) =>
                              handleStatusChange(
                                booking._id,
                                e.target.value,
                                booking.email,
                                booking.service,
                                booking.bookingDate || booking.date,
                                booking.phone,
                              )
                            }
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Ready for Delivery">Ready for Delivery</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <button className="btn-small btn-delete" onClick={() => handleDeleteBooking(booking._id)}>
                          <DeleteIcon /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.service}
              </Typography>
              <Typography variant="body1">
                <strong>Customer:</strong> {selectedBooking.name || selectedBooking.email}
              </Typography>
              {selectedBooking.phone && (
                <Typography variant="body1">
                  <strong>Phone:</strong> {selectedBooking.phone}
                </Typography>
              )}
              {selectedBooking.address && (
                <Typography variant="body1">
                  <strong>Address:</strong> {selectedBooking.address}
                </Typography>
              )}
              <Typography variant="body1">
                <strong>Date:</strong> {selectedBooking.bookingDate || selectedBooking.date}
              </Typography>
              <Typography variant="body1">
                <strong>Booked on:</strong> {selectedBooking.timestamp}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedBooking.status}
                  color={
                    selectedBooking.status === "Pending"
                      ? "warning"
                      : selectedBooking.status === "In Progress"
                        ? "info"
                        : selectedBooking.status === "Ready for Delivery"
                          ? "success"
                          : "primary"
                  }
                  size="small"
                />
              </Typography>
              {selectedBooking.serviceDetails && (
                <div style={{ marginTop: "1rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Service Plan Details:
                  </Typography>
                  <Typography variant="body2">Price: ${selectedBooking.serviceDetails.price}</Typography>
                  <Typography variant="body2">Duration: {selectedBooking.serviceDetails.duration} hours</Typography>
                  {selectedBooking.serviceDetails.description && (
                    <Typography variant="body2">Description: {selectedBooking.serviceDetails.description}</Typography>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails} variant="contained">
                Close
              </Button>
              <Button onClick={() => handleDeleteBooking(selectedBooking._id)} color="error" variant="outlined">
                Delete Booking
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default OwnerDashboard
