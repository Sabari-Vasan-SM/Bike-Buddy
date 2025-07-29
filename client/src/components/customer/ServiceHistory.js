"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import jsPDF from "jspdf"
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Chip, IconButton } from "@mui/material"
import {
  ArrowBack as BackIcon,
  History as HistoryIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

function ServiceHistory() {
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
    if (!user || user.role !== "customer") {
      navigate("/")
    } else {
      const loadBookings = async () => {
        try {
          const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/bookings?email=${user.email}`)
          const bookingsData = await res.json()
          setBookings(bookingsData)
          setFilteredBookings(bookingsData)
        } catch (err) {
          console.error("Failed to load bookings:", err)
          setBookings([])
          setFilteredBookings([])
          showNotification("Failed to load service history. Please refresh the page.", "error")
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
      filtered = filtered.filter((booking) => booking.service.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    setFilteredBookings(filtered)
  }, [bookings, filter, searchTerm])

  const handleDownloadInvoice = (booking) => {
    const doc = new jsPDF()
    // Green header
    doc.setFillColor(16, 185, 129)
    doc.roundedRect(0, 0, 210, 30, 0, 0, "F")

    doc.setFontSize(22)
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.text("Cartrabbit Bike Service", 105, 18, { align: "center" })
    doc.setFontSize(12)
    doc.text("INVOICE", 180, 18, { align: "right" })

    // Invoice details
    doc.setFont("helvetica", "normal")
    doc.setTextColor(60, 60, 60)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 38)
    doc.text(`Booking ID: ${booking._id || "-"}`, 15, 46)

    // Customer Details
    doc.setFillColor(236, 239, 241)
    doc.roundedRect(10, 54, 90, 40, 4, 4, "F")
    doc.setFontSize(13)
    doc.setTextColor(16, 185, 129)
    doc.text("Customer Details", 15, 62)
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(`Name: ${booking.name || "-"}`, 15, 70)
    doc.text(`Email: ${booking.email || "-"}`, 15, 76)
    doc.text(`Phone: ${booking.phone || "-"}`, 15, 82)

    // Service Details
    doc.setFillColor(232, 254, 240)
    doc.roundedRect(110, 54, 90, 40, 4, 4, "F")
    doc.setFontSize(13)
    doc.setTextColor(16, 185, 129)
    doc.text("Service Details", 115, 62)
    doc.setFontSize(11)
    doc.setTextColor(60, 60, 60)
    doc.text(`Service: ${booking.service || "-"}`, 115, 70)
    doc.text(`Date: ${booking.bookingDate || "-"}`, 115, 76)
    doc.text(`Price: $${booking.serviceDetails?.price || "0"}`, 115, 82)
    doc.text(`Duration: ${booking.serviceDetails?.duration || "-"} hrs`, 115, 88)

    doc.save(`Invoice_${booking._id || "booking"}.pdf`)
    showNotification("Invoice downloaded successfully!", "success")
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
    return <LoadingScreen type="customer" />
  }

  return (
    <div className="service-history-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/customer")}>
          <BackIcon />
          <span>Back to Dashboard</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">
            <HistoryIcon />
            Service History
          </h1>
          <p className="page-subtitle">Track all your bike service bookings and history</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-group">
          <div className="filter-item">
            <FilterIcon />
            <select className="filter-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Services ({bookings.length})</option>
              <option value="Pending">Pending ({bookings.filter((b) => b.status === "Pending").length})</option>
              <option value="In Progress">
                In Progress ({bookings.filter((b) => b.status === "In Progress").length})
              </option>
              <option value="Ready for Delivery">
                Ready ({bookings.filter((b) => b.status === "Ready for Delivery").length})
              </option>
              <option value="Completed">Completed ({bookings.filter((b) => b.status === "Completed").length})</option>
            </select>
          </div>

          <div className="search-item">
            <SearchIcon />
            <input
              className="search-input"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="results-info">
          Showing {filteredBookings.length} of {bookings.length} services
        </div>
      </div>

      {/* Service History List */}
      <div className="history-section">
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No services found</h3>
            <p>No services match your current filter criteria</p>
            <button className="empty-action-btn" onClick={() => navigate("/customer/book-service")}>
              Book Your First Service
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="history-card">
                <div className="history-header">
                  <div className="service-info">
                    <h3 className="service-name">{booking.service}</h3>
                    <div className="service-date">{booking.bookingDate}</div>
                  </div>
                  <Chip label={booking.status} color={getStatusColor(booking.status)} size="small" />
                </div>

                <div className="history-details">
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">${booking.serviceDetails?.price || 0}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{booking.serviceDetails?.duration || 0}h</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Booked:</span>
                    <span className="detail-value">{booking.timestamp}</span>
                  </div>
                </div>

                <div className="history-actions">
                  <button className="action-btn view-btn" onClick={() => setSelectedBooking(booking)}>
                    <ViewIcon />
                    View Details
                  </button>
                  <button className="action-btn download-btn" onClick={() => handleDownloadInvoice(booking)}>
                    <DownloadIcon />
                    Invoice
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
                <span>Service Details</span>
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
                  <p>
                    <strong>Status:</strong>
                    <Chip
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status)}
                      size="small"
                      style={{ marginLeft: "8px" }}
                    />
                  </p>
                  {selectedBooking.serviceDetails?.description && (
                    <p>
                      <strong>Description:</strong> {selectedBooking.serviceDetails.description}
                    </p>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Booking Information</h4>
                  <p>
                    <strong>Service Date:</strong> {selectedBooking.bookingDate}
                  </p>
                  <p>
                    <strong>Booked On:</strong> {selectedBooking.timestamp}
                  </p>
                  <p>
                    <strong>Customer:</strong> {selectedBooking.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedBooking.phone}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedBooking.address}
                  </p>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedBooking(null)} variant="contained">
                Close
              </Button>
              <Button onClick={() => handleDownloadInvoice(selectedBooking)} variant="outlined">
                Download Invoice
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default ServiceHistory
