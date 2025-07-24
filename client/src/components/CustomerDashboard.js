// "use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material"

function CustomerDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [bookings, setBookings] = useState([])
  const [selectedService, setSelectedService] = useState("")
  const [bookingDate, setBookingDate] = useState("")
  const [openBookingDialog, setOpenBookingDialog] = useState(false) // Renamed for clarity
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false) // New state for details dialog
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null) // State for selected booking details
  const [bookingFormDetails, setBookingFormDetails] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const [services, setServices] = useState([])

  useEffect(() => {
    if (!user || user.role !== "customer") {
      navigate("/login")
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch(`http://localhost:5000/api/bookings?email=${user.email}`),
            fetch("http://localhost:5000/api/services"),
          ])
          const bookingsData = await bookingsRes.json()
          const servicesData = await servicesRes.json()
          setBookings(bookingsData)
          setServices(servicesData)
        } catch (err) {
          console.error("Failed to load data:", err)
          setBookings([])
          setServices([])
        }
      }
      loadData()
    }
  }, [navigate, user])

  const handleOpenBookingDialog = () => {
    if (!bookingDate || !selectedService) {
      alert("Please select a service and date")
      return
    }
    setOpenBookingDialog(true)
  }

  const handleCloseBookingDialog = () => {
    setOpenBookingDialog(false)
  }

  const handleBookingFormInputChange = (e) => {
    const { name, value } = e.target
    setBookingFormDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      const res = await fetch("http://localhost:5000/api/bookings", {
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
        alert(`Booking confirmed for ${selectedService} on ${booking.bookingDate}`)
      } else {
        alert("Failed to book service")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
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

  return (
    <div className="dashboard-container">
      <Typography variant="h4" gutterBottom sx={{ color: "var(--primary-color)", fontWeight: 600 }}>
        Welcome, {user?.email}!
      </Typography>

      <Card className="card section-card">
        <Typography variant="h5" gutterBottom sx={{ color: "var(--text-dark)" }}>
          Book a Service
        </Typography>

        <div className="service-booking-section">
          <FormControl fullWidth>
            <InputLabel>Select a service</InputLabel>
            <Select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              label="Select a service"
            >
              <MenuItem value="">Select a service</MenuItem>
              {services.map((service) => (
                <MenuItem key={service._id} value={service.name}>
                  {service.name} (${service.price}, {service.duration} hrs)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            value={bookingDate}
            onChange={(e) => setBookingDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            label="Service Date"
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={handleOpenBookingDialog}
            disabled={!selectedService || !bookingDate}
            sx={{ height: "56px", minWidth: "150px" }}
          >
            Book Now
          </Button>
        </div>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ color: "var(--text-dark)" }}>
        Your Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Card className="card section-card no-bookings-message">
          <Typography>No bookings yet. Book your first service!</Typography>
        </Card>
      ) : (
        <div>
          {bookings.map((b, index) => (
            <Card
              key={b._id}
              className={`booking-card status-${b.status.replace(/\s/g, "")}`}
              sx={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent>
                <div className="booking-card-header">
                  <Typography variant="h6" sx={{ color: "var(--text-dark)" }}>
                    {b.service}
                  </Typography>
                  <Chip
                    label={b.status}
                    color={
                      b.status === "Pending"
                        ? "warning"
                        : b.status === "In Progress"
                          ? "info"
                          : b.status === "Ready for Delivery"
                            ? "success"
                            : "primary" // Use primary for completed
                    }
                    sx={{ fontWeight: "bold" }}
                  />
                </div>
                <Typography variant="body2" color="text.secondary">
                  Date: {b.bookingDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Booked on: {b.timestamp}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Price: ${b.serviceDetails?.price} | Duration: {b.serviceDetails?.duration} hours
                </Typography>
                {b.status === "Ready for Delivery" && (
                  <div className="service-ready-message">
                    <Typography variant="body2">Your service is ready! Please collect your bike.</Typography>
                  </div>
                )}
                <Button variant="outlined" size="small" sx={{ mt: 2 }} onClick={() => handleViewDetails(b)}>
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Contact Support Section */}
      <div className="contact-support-section">
        <Typography variant="h5" gutterBottom>
          Need Assistance?
        </Typography>
        <Typography variant="body1">
          If you have any questions or need support with your bookings, feel free to reach out to us.
        </Typography>
        <Typography variant="body1">
          Email: <a href="mailto:support@cartrabbit.com">support@cartrabbit.com</a>
        </Typography>
        <Typography variant="body1">Phone: +1 (555) 123-4567</Typography>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={openBookingDialog} onClose={handleCloseBookingDialog}>
        <DialogTitle>Confirm Booking Details</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Full Name"
            type="text"
            fullWidth
            variant="outlined"
            value={bookingFormDetails.name}
            onChange={handleBookingFormInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={bookingFormDetails.phone}
            onChange={handleBookingFormInputChange}
            required
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={bookingFormDetails.address}
            onChange={handleBookingFormInputChange}
            required
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Service: {selectedService}
          </Typography>
          <Typography variant="subtitle1">Date: {new Date(bookingDate).toLocaleDateString()}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBookingDialog}>Cancel</Button>
          <Button onClick={handleBook} variant="contained" color="primary">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Details Dialog (New) */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDetailsDialog} maxWidth="sm" fullWidth>
        {selectedBookingDetails && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent dividers>
              <Typography variant="h6" gutterBottom>
                {selectedBookingDetails.service}
              </Typography>
              <Typography variant="body1">
                <strong>Customer:</strong> {selectedBookingDetails.name} ({selectedBookingDetails.email})
              </Typography>
              <Typography variant="body1">
                <strong>Phone:</strong> {selectedBookingDetails.phone}
              </Typography>
              <Typography variant="body1">
                <strong>Address:</strong> {selectedBookingDetails.address}
              </Typography>
              <Typography variant="body1">
                <strong>Service Date:</strong> {selectedBookingDetails.bookingDate || selectedBookingDetails.date}
              </Typography>
              <Typography variant="body1">
                <strong>Booked On:</strong> {selectedBookingDetails.timestamp}
              </Typography>
              <Typography variant="body1">
                <strong>Status:</strong>{" "}
                <Chip
                  label={selectedBookingDetails.status}
                  color={
                    selectedBookingDetails.status === "Pending"
                      ? "warning"
                      : selectedBookingDetails.status === "In Progress"
                        ? "info"
                        : selectedBookingDetails.status === "Ready for Delivery"
                          ? "success"
                          : "primary"
                  }
                  size="small"
                />
              </Typography>
              {selectedBookingDetails.serviceDetails && (
                <div style={{ marginTop: "1rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                    Service Plan Details:
                  </Typography>
                  <Typography variant="body2">Price: ${selectedBookingDetails.serviceDetails.price}</Typography>
                  <Typography variant="body2">
                    Duration: {selectedBookingDetails.serviceDetails.duration} hours
                  </Typography>
                  {selectedBookingDetails.serviceDetails.description && (
                    <Typography variant="body2">
                      Description: {selectedBookingDetails.serviceDetails.description}
                    </Typography>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
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
