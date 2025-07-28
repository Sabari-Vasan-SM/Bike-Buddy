// "use client"

import { useEffect, useState } from "react"
import jsPDF from "jspdf"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Chip,
  Paper,
  Stack,
  IconButton,
} from "@mui/material"
import {
  CalendarToday as CalendarIcon,
  SupportAgent as SupportIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon,
  Email as EmailIcon,
} from "@mui/icons-material"

function CustomerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [selectedService, setSelectedService] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [openBookingDialog, setOpenBookingDialog] = useState(false)
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false)
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null)
  const [bookingFormDetails, setBookingFormDetails] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [services, setServices] = useState([])
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
    if (!user || user.role !== "customer") {
      navigate("/login")
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch(`https://cartrabbit-1-p9a2.onrender.com/api/bookings?email=${user.email}`),
            fetch("https://cartrabbit-1-p9a2.onrender.com/api/services"),
          ])
          setBookings(await bookingsRes.json())
          setServices(await servicesRes.json())
        } catch (err) {
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

  const handleOpenBookingDialog = () => {
    if (!bookingDate || !selectedService) {
      showNotification("Please select a service and date", "warning")
      return
    }
    setOpenBookingDialog(true)
  }

  const handleCloseBookingDialog = () => setOpenBookingDialog(false)

  const handleBookingFormInputChange = (e) => {
    const { name, value } = e.target
    setBookingFormDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleBook = async () => {
    const selectedServiceData = services.find((s) => s.name === selectedService)
    const booking = {
      email: user.email,
      name: bookingFormDetails.name,
      phone: bookingFormDetails.phone,
      address: bookingFormDetails.address,
      service: selectedService,
      serviceDetails: selectedServiceData,
      date: bookingDate,
      status: "Pending",
      timestamp: new Date().toLocaleString(),
      bookingDate: new Date(bookingDate).toLocaleDateString(),
    }

    try {
      const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(booking),
      })

      if (res.ok) {
        const created = await res.json()
        setBookings([...bookings, created])
        setSelectedService("")
        setBookingDate("")
        setBookingFormDetails({ name: "", phone: "", address: "" })
        setOpenBookingDialog(false)
        showNotification(`Booking confirmed for ${selectedService} on ${booking.bookingDate}`, "success")
      } else {
        showNotification("Failed to book service. Please try again.", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleViewDetails = (booking) => {
    setSelectedBookingDetails(booking)
    setOpenDetailsDialog(true)
  }

  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false)
    setSelectedBookingDetails(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "warning"
      case "In Progress":
        return "info"
      case "Ready for Delivery":
        return "success"
      default:
        return "primary"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Ready for Delivery":
        return <CheckCircleIcon />
      case "In Progress":
        return <ScheduleIcon />
      default:
        return <ReceiptIcon />
    }
  }

  // Download invoice as PDF
  const handleDownloadInvoice = (booking) => {
    const doc = new jsPDF()
    // Green header
    doc.setFillColor(16, 185, 129) // green
    doc.roundedRect(0, 0, 210, 30, 0, 0, 'F')

    // Add logo image (async fetch and convert to base64)
    const logoUrl = "https://cartrabbit.io/wp-content/uploads/2025/03/cartrabbit.svg"
    const imgWidth = 28
    const imgHeight = 28
    const addContent = (logoDataUrl) => {
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, 'PNG', 10, 2, imgWidth, imgHeight)
      }
      doc.setFontSize(22)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('Cartrabbit Bike Service', 105, 18, { align: 'center' })
      doc.setFontSize(12)
      doc.setTextColor(255, 255, 255)
      doc.text('INVOICE', 180, 18, { align: 'right' })

      // Invoice meta
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(60, 60, 60)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 38)
      doc.text(`Booking ID: ${booking._id || '-'}`, 15, 46)

      // Customer Details box
      doc.setFillColor(236, 239, 241)
      doc.roundedRect(10, 54, 90, 40, 4, 4, 'F')
      doc.setFontSize(13)
      doc.setTextColor(16, 185, 129)
      doc.text('Customer Details', 15, 62)
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.text(`Name: ${booking.name || '-'}`, 15, 70)
      doc.text(`Email: ${booking.email || '-'}`, 15, 76)
      doc.text(`Phone: ${booking.phone || '-'}`, 15, 82)
      doc.text(`Address: ${booking.address || '-'}`, 15, 88)

      // Service Details box
      doc.setFillColor(232, 254, 240)
      doc.roundedRect(110, 54, 90, 54, 4, 4, 'F')
      doc.setFontSize(13)
      doc.setTextColor(16, 185, 129)
      doc.text('Service Details', 115, 62)
      doc.setFontSize(11)
      doc.setTextColor(60, 60, 60)
      doc.text(`Service: ${booking.service || '-'}`, 115, 70)
      doc.text(`Date: ${booking.bookingDate || '-'}`, 115, 76)
      doc.text(`Price: $${booking.serviceDetails?.price || '0'}`, 115, 82)
      doc.text(`Duration: ${booking.serviceDetails?.duration || '-'} hrs`, 115, 88)
      if (booking.serviceDetails?.description) {
        doc.text(`Description:`, 115, 94)
        doc.setFontSize(10)
        doc.text(booking.serviceDetails.description, 115, 100, { maxWidth: 80 })
        doc.setFontSize(11)
      }

      // Status badge
      let statusColor = [245, 158, 11] // default: yellow
      if (booking.status === 'In Progress') statusColor = [6, 182, 212]
      if (booking.status === 'Ready for Delivery' || booking.status === 'Completed') statusColor = [16, 185, 129]
      doc.setFillColor(...statusColor)
      doc.roundedRect(15, 105, 40, 12, 6, 6, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      doc.text(`Status: ${booking.status || '-'}`, 35, 114, { align: 'center' })

      // Thank you note
      doc.setFontSize(12)
      doc.setTextColor(16, 185, 129)
      doc.text('Thank you for booking with Cartrabbit!', 15, 135)

      doc.save(`Invoice_${booking._id || 'booking'}.pdf`)
    }

    // Convert SVG to PNG for jsPDF
    fetch(logoUrl)
      .then((res) => res.text())
      .then((svgText) => {
        const svg = new Blob([svgText], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(svg)
        const img = new window.Image()
        img.crossOrigin = 'Anonymous'
        img.onload = function () {
          const canvas = document.createElement('canvas')
          canvas.width = imgWidth * 4
          canvas.height = imgHeight * 4
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/png')
          addContent(dataUrl)
          URL.revokeObjectURL(url)
        }
        img.onerror = function () {
          addContent(null)
        }
        img.src = url
      })
      .catch(() => addContent(null))
  }

  // Calculate stats
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === "Pending").length
  const completedBookings = bookings.filter((b) => b.status === "Completed").length

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div className="loading"></div>
          <p style={{ marginTop: "16px", color: "var(--text-secondary)" }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1 className="welcome-title">Welcome back, {user?.email.split("@")[0]}! 👋</h1>
          <p className="welcome-subtitle">Book and manage your bike services with ease</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{totalBookings}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{pendingBookings}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{completedBookings}</span>
          <span className="stat-label">Completed</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="main-grid">
        {/* Book Service Section */}
        <div className="booking-form-card">
          <h2 className="form-title">
            <CalendarIcon /> Book a Service
          </h2>

          <div className="form-group">
            <label className="form-label">Select Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="form-select"
            >
              <option value="">Choose a service</option>
              {services.map((service) => (
                <option key={service._id} value={service.name}>
                  {service.name} (₹{service.price}, {service.duration} hrs)
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Service Date</label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="form-input"
            />
          </div>

          <button className="book-button" onClick={handleOpenBookingDialog} disabled={!selectedService || !bookingDate}>
            Continue Booking
          </button>
        </div>

        {/* Bookings List Section */}
        <div className="bookings-card">
          <h2 className="bookings-title">
            <InfoIcon /> Your Bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No bookings yet</h3>
              <p className="empty-subtitle">Book your first service to get started!</p>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-item">
                  <div className="booking-header">
                    <h3 className="booking-service">{booking.service}</h3>
                    <span className={`status-badge status-${booking.status.toLowerCase().replace(/\s/g, "")}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-details">
                    <span>📅 {booking.bookingDate}</span>
                    <span>💰 ₹{booking.serviceDetails?.price || "0"}</span>
                    <span>⏱️ {booking.serviceDetails?.duration || "0"} hrs</span>
                  </div>
                  <div className="booking-actions" style={{ display: "flex", gap: 8 }}>
                    <button className="view-details-btn" onClick={() => handleViewDetails(booking)}>
                      View Details
                    </button>
                    <button className="view-details-btn" onClick={() => handleDownloadInvoice(booking)}>
                      Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Support Section */}
      <div className="support-section">
        <h2 className="support-title">
          <SupportIcon /> Need Help?
        </h2>
        <p className="support-content">Our support team is here to help with any questions about your bookings.</p>
        <div className="support-contacts">
          <div className="contact-item">
            <EmailIcon />
            <div>
              <strong>Email:</strong>
              <br />
              support@cartrabbitbikeservice.com
            </div>
          </div>
          <div className="contact-item">
            <PhoneIcon />
            <div>
              <strong>Phone:</strong>
              <br />
              +1 (555) 123-4567
            </div>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={handleCloseBookingDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Confirm Booking</Typography>
            <IconButton onClick={handleCloseBookingDialog}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                SERVICE DETAILS
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography>{selectedService}</Typography>
                  <Typography fontWeight="bold">
                     ₹{services.find((s) => s.name === selectedService)?.price || "0"}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Scheduled for {new Date(bookingDate).toLocaleDateString()}
                </Typography>
              </Paper>
            </Stack>

            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">
                YOUR INFORMATION
              </Typography>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={bookingFormDetails.name}
                onChange={handleBookingFormInputChange}
                InputProps={{
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={bookingFormDetails.phone}
                onChange={handleBookingFormInputChange}
                InputProps={{
                  startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={3}
                value={bookingFormDetails.address}
                onChange={handleBookingFormInputChange}
                InputProps={{
                  startAdornment: <HomeIcon color="action" sx={{ mr: 1, mt: -2, alignSelf: "flex-start" }} />,
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseBookingDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleBook}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} fullWidth maxWidth="sm">
        {selectedBookingDetails && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Booking Details</Typography>
                <IconButton onClick={handleCloseDetailsDialog}>
                  <CloseIcon />
                </IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={3}>
                {/* Service Summary */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedBookingDetails.service}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedBookingDetails.status)}
                      label={selectedBookingDetails.status}
                      color={getStatusColor(selectedBookingDetails.status)}
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      {selectedBookingDetails.bookingDate}
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      ₹{selectedBookingDetails.serviceDetails?.price || "0"}
                    </Typography>
                  </Stack>
                </Paper>

                {/* Customer Info */}
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    CUSTOMER INFORMATION
                  </Typography>
                  <Stack spacing={1}>
                    <Typography>
                      <strong>Name:</strong> {selectedBookingDetails.name}
                    </Typography>
                    <Typography>
                      <strong>Email:</strong> {selectedBookingDetails.email}
                    </Typography>
                    <Typography>
                      <strong>Phone:</strong> {selectedBookingDetails.phone}
                    </Typography>
                    <Typography>
                      <strong>Address:</strong> {selectedBookingDetails.address}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Service Details */}
                {selectedBookingDetails.serviceDetails && (
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      SERVICE DETAILS
                    </Typography>
                    <Stack spacing={1}>
                      <Typography>
                        <strong>Duration:</strong> {selectedBookingDetails.serviceDetails.duration} hours
                      </Typography>
                      {selectedBookingDetails.serviceDetails.description && (
                        <Typography>
                          <strong>Description:</strong> {selectedBookingDetails.serviceDetails.description}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDetailsDialog} variant="contained">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default CustomerDashboard
