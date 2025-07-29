"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, IconButton } from "@mui/material"
import {
  ArrowBack as BackIcon,
  Assignment as AssignmentIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

function BookingsManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBooking, setSelectedBooking] = useState(null)

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
      const loadBookings = async () => {
        try {
          const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/bookings")
          const bookingsData = await res.json()
          setBookings(bookingsData)
          setFilteredBookings(bookingsData)
        } catch (err) {
          console.error("Failed to load bookings:", err)
          setBookings([])
          setFilteredBookings([])
          showNotification("Failed to load bookings. Please refresh the page.", "error")
        } finally {
          setTimeout(() => {
            setIsLoading(false)
          }, 1500)
        }
      }
      loadBookings()
    }
  }, [navigate, user])

  useEffect(() => {
    let filtered = bookings

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((booking) => booking.status === filter)
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredBookings(filtered)
  }, [bookings, filter, searchTerm])

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setBookings(bookings.map((b) => (b._id === id ? { ...b, status: newStatus } : b)))
        showNotification(`Booking status updated to ${newStatus}`, "success")
      } else {
        showNotification("Failed to update booking status", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "In Progress":
        return "info"
      case "Ready for Delivery":
        return "success"
      case "Completed":
        return "primary"
      default:
        return "default"
    }
  }

  if (isLoading) {
    return <LoadingScreen type="owner" />
  }

  return (
    <div className="bookings-management">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/owner")}>
          <BackIcon />
          <span>Back to Dashboard</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">
            <AssignmentIcon />
            Bookings Management
          </h1>
          <p className="page-subtitle">View and manage all customer service bookings</p>
        </div>
        <button className="export-btn" onClick={exportBookings}>
          <ExportIcon />
          Export CSV
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="filters-group">
          <div className="filter-item">
            <FilterIcon />
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Bookings ({bookings.length})</option>
              <option value="Pending">Pending ({bookings.filter((b) => b.status === "Pending").length})</option>
              <option value="In Progress">
                In Progress ({bookings.filter((b) => b.status === "In Progress").length})
              </option>
              <option value="Ready for Delivery">
                Ready for Delivery ({bookings.filter((b) => b.status === "Ready for Delivery").length})
              </option>
              <option value="Completed">Completed ({bookings.filter((b) => b.status === "Completed").length})</option>
            </select>
          </div>

          <div className="search-item">
            <SearchIcon />
            <input
              className="search-input"
              placeholder="Search by customer, email, or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="results-info">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Bookings List */}
      <div className="bookings-list-section">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No bookings found</h3>
            <p>No bookings match your current filter criteria</p>
          </div>
        ) : (
          <div className="bookings-table">
            <div className="table-header">
              <div className="header-cell">Customer</div>
              <div className="header-cell">Service</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Price</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Actions</div>
            </div>

            {filteredBookings.map((booking) => (
              <div key={booking._id} className="table-row">
                <div className="table-cell customer-cell">
                  <div className="customer-avatar">
                    {booking.name ? booking.name.charAt(0).toUpperCase() : booking.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="customer-info">
                    <div className="customer-name">{booking.name || "N/A"}</div>
                    <div className="customer-email">{booking.email}</div>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="service-name">{booking.service}</div>
                  <div className="service-duration">{booking.serviceDetails?.duration || 0}h</div>
                </div>

                <div className="table-cell">
                  <div className="booking-date">{booking.bookingDate || booking.date}</div>
                  <div className="booking-time">{booking.timestamp}</div>
                </div>

                <div className="table-cell">
                  <div className="price">${booking.serviceDetails?.price || 0}</div>
                </div>

                <div className="table-cell">
                  <select
                    className={`status-select status-${booking.status.toLowerCase().replace(/\s/g, "")}`}
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="table-cell actions-cell">
                  <button className="action-btn view-btn" onClick={() => setSelectedBooking(booking)}>
                    <ViewIcon />
                  </button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteBooking(booking._id)}>
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onClose={() => setSelectedBooking(null)} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Booking Details</span>
                <IconButton onClick={() => setSelectedBooking(null)}>
                  <CloseIcon />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent dividers>
              <div className="booking-details-content">
                <div className="detail-section">
                  <h4>Service Information</h4>
                  <p>
                    <strong>Service:</strong> {selectedBooking.service}
                  </p>
                  <p>
                    <strong>Price:</strong> ${selectedBooking.serviceDetails?.price || 0}
                  </p>
                  <p>
                    <strong>Duration:</strong> {selectedBooking.serviceDetails?.duration || 0} hours
                  </p>
                  {selectedBooking.serviceDetails?.description && (
                    <p>
                      <strong>Description:</strong> {selectedBooking.serviceDetails.description}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>
                    <Chip
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status)}
                      size="small"
                      style={{ marginLeft: "8px" }}
                    />
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Customer Information</h4>
                  <p>
                    <strong>Name:</strong> {selectedBooking.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedBooking.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBooking.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedBooking.address}
                  </p>
                </div>

                <div className="detail-section">
                  <h4>Booking Information</h4>
                  <p>
                    <strong>Service Date:</strong> {selectedBooking.bookingDate || selectedBooking.date}
                  </p>
                  <p>
                    <strong>Booked On:</strong> {selectedBooking.timestamp}
                  </p>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBooking(null)} variant="contained">
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

export default BookingsManagement
