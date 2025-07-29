"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton } from "@mui/material"
import {
  ArrowBack as BackIcon,
  CalendarToday as CalendarIcon,
  Build as BuildIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Close as CloseIcon,
} from "@mui/icons-material"

function BookService() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem("user"))
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [openBookingDialog, setOpenBookingDialog] = useState(false)
  const [bookingFormDetails, setBookingFormDetails] = useState({
    name: "",
    phone: "",
    address: "",
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
    if (!user || user.role !== "customer") {
      navigate("/")
    } else {
      const loadServices = async () => {
        try {
          const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/services")
          const servicesData = await res.json()
          setServices(servicesData)

          // Set pre-selected service if passed from dashboard
          if (location.state?.selectedService) {
            setSelectedService(location.state.selectedService)
          }
        } catch (err) {
          console.error("Failed to load services:", err)
          setServices([])
          showNotification("Failed to load services. Please refresh the page.", "error")
        } finally {
          setTimeout(() => {
            setIsLoading(false)
          }, 1500)
        }
      }
      loadServices()
    }
  }, [navigate, user, location.state])

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
        setSelectedService("")
        setBookingDate("")
        setBookingFormDetails({ name: "", phone: "", address: "" })
        setOpenBookingDialog(false)
        showNotification(`Booking confirmed for ${selectedService} on ${booking.bookingDate}`, "success")
        setTimeout(() => {
          navigate("/customer")
        }, 2000)
      } else {
        showNotification("Failed to book service. Please try again.", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  if (isLoading) {
    return <LoadingScreen type="customer" />
  }

  const selectedServiceData = services.find((s) => s.name === selectedService)

  return (
    <div className="book-service-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/customer")}>
          <BackIcon />
          <span>Back to Dashboard</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">
            <CalendarIcon />
            Book a Service
          </h1>
          <p className="page-subtitle">Schedule your bike service with our professional technicians</p>
        </div>
      </div>

      {/* Service Selection */}
      <div className="booking-section">
        <div className="booking-card service-selection">
          <h2 className="section-title">
            <BuildIcon />
            Choose Your Service
          </h2>
          <div className="services-grid">
            {services.map((service) => (
              <div
                key={service._id}
                className={`service-option ${selectedService === service.name ? "selected" : ""}`}
                onClick={() => setSelectedService(service.name)}
              >
                <div className="service-header">
                  <h3 className="service-name">{service.name}</h3>
                  <div className="service-price">₹{service.price}</div>
                </div>
                <div className="service-details">
                  <div className="service-duration">⏱️ {service.duration} hours</div>
                  {service.description && <p className="service-description">{service.description}</p>}
                </div>
                <div className="service-features">
                  <div className="feature">✓ Professional service</div>
                  <div className="feature">✓ Quality guarantee</div>
                  <div className="feature">✓ Expert technicians</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date Selection */}
        <div className="booking-card date-selection">
          <h2 className="section-title">
            <CalendarIcon />
            Select Date & Time
          </h2>
          <div className="date-picker-section">
            <div className="date-input-group">
              <label className="date-label">Preferred Service Date</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="date-input"
              />
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="booking-card booking-summary">
          <h2 className="section-title">Booking Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">Service:</span>
              <span className="summary-value">{selectedService || "Not selected"}</span> {/* Show default text if not selected */}
            </div>
            <div className="summary-item">
              <span className="summary-label">Date:</span>
              <span className="summary-value">{bookingDate ? new Date(bookingDate).toLocaleDateString() : "Not selected"}</span> {/* Show default text if not selected */}
            </div>
            <div className="summary-item">
              <span className="summary-label">Duration:</span>
              <span className="summary-value">{selectedServiceData?.duration || 0} hours</span>
            </div>
            <div className="summary-item total">
              <span className="summary-label">Total Price:</span>
              <span className="summary-value">₹{selectedServiceData?.price || 0}</span>
            </div>
          </div>
          <button className="confirm-booking-btn" onClick={handleOpenBookingDialog}>
            Confirm Booking
          </button>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={handleCloseBookingDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Complete Your Booking</span>
            <IconButton onClick={handleCloseBookingDialog}>
              <CloseIcon />
            </IconButton>
          </div>
        </DialogTitle>
        <DialogContent dividers>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={bookingFormDetails.name}
              onChange={handleBookingFormInputChange}
              InputProps={{
                startAdornment: <PersonIcon color="action" style={{ marginRight: "8px" }} />,
              }}
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={bookingFormDetails.phone}
              onChange={handleBookingFormInputChange}
              InputProps={{
                startAdornment: <PhoneIcon color="action" style={{ marginRight: "8px" }} />,
              }}
              required
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
                startAdornment: (
                  <HomeIcon color="action" style={{ marginRight: "8px", alignSelf: "flex-start", marginTop: "12px" }} />
                ),
              }}
              required
            />
          </div>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button onClick={handleCloseBookingDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleBook}>
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BookService
