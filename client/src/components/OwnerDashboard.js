"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import emailjs from "emailjs-com"
import {
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
// Removed styled from @mui/system

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

  useEffect(() => {
    if (!user || user.role !== "owner") {
      navigate("/")
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch("http://localhost:5000/api/bookings"),
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
    // Initialize EmailJS with public key from environment variable
    emailjs.init(process.env.REACT_APP_EMAILJS_PUBLIC_KEY)
  }, [navigate, user])

  const handleStatusChange = async (id, newStatus, customerEmail, serviceName, bookingDate, customerMobile) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setBookings((bookings) =>
          bookings.map(
            (b) => (b._id === id ? { ...b, status: newStatus } : b), // Use _id for MongoDB
          ),
        )

        if (newStatus === "Ready for Delivery" && customerEmail) {
          const templateParams = {
            user_email: customerEmail,
            user_message: `Hi, your service for "${serviceName}" is ready for delivery!`,
            service_name: serviceName,
            service_date: bookingDate,
            customer_mobile: customerMobile || "",
          }
          emailjs
            .send(process.env.REACT_APP_EMAILJS_SERVICE_ID, process.env.REACT_APP_EMAILJS_TEMPLATE_ID, templateParams)
            .then((res) => {
              console.log("Email successfully sent!", res.status, res.text)
            })
            .catch((err) => {
              console.error("Email send failed:", err)
            })
        }
      } else {
        alert("Failed to update booking status")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
    }
  }

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      alert("Please fill all required service fields")
      return
    }
    try {
      const res = await fetch("http://localhost:5000/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (res.ok) {
        const created = await res.json()
        setServices((prev) => [...prev, created])
        setNewService({ name: "", price: "", duration: "", description: "" })
      } else {
        const errorText = await res.text()
        alert("Failed to add service: " + errorText)
      }
    } catch (err) {
      alert("Server error. Please try again later. " + (err?.message || ""))
    }
  }

  const handleUpdateService = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/services/${editingService._id}`, {
        // Use _id
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      })
      if (res.ok) {
        const updated = await res.json()
        setServices(services.map((s) => (s._id === updated._id ? updated : s))) // Use _id
        setEditingService(null)
      } else {
        alert("Failed to update service")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
    }
  }

  const handleDeleteService = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setServices(services.filter((s) => s._id !== id)) // Use _id
      } else {
        alert("Failed to delete service")
      }
    } catch (err) {
      alert("Server error. Please try again later.")
    }
  }

  const filteredBookings = filter === "all" ? bookings : bookings.filter((b) => b.status === filter)

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking)
  }

  const handleCloseDetails = () => {
    setSelectedBooking(null)
  }

  return (
    <div className="owner-dashboard-container">
      {" "}
      {/* Replaced DashboardContainer styled component */}
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage services and bookings
      </Typography>
      <div className="owner-dashboard-grid">
        {" "}
        {/* Replaced inline style */}
        <div>
          <Card sx={{ p: 2, mb: 3 }} className="card service-management-card">
            {" "}
            {/* Added classes */}
            <Typography variant="h5" gutterBottom>
              Manage Services
            </Typography>
            <div className="service-form-fields">
              {" "}
              {/* Replaced inline style */}
              <TextField
                label="Service Name"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, name: e.target.value })
                    : setNewService({ ...newService, name: e.target.value })
                }
                required
              />
              <TextField
                label="Price"
                value={editingService ? editingService.price : newService.price}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, price: e.target.value })
                    : setNewService({ ...newService, price: e.target.value })
                }
                required
              />
              <TextField
                label="Duration (hours)"
                value={editingService ? editingService.duration : newService.duration}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, duration: e.target.value })
                    : setNewService({ ...newService, duration: e.target.value })
                }
                required
              />
              <TextField
                label="Description"
                multiline
                rows={2}
                value={editingService ? editingService.description : newService.description}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, description: e.target.value })
                    : setNewService({ ...newService, description: e.target.value })
                }
              />
              {editingService ? (
                <div style={{ display: "flex", gap: "1rem" }}>
                  <Button variant="contained" onClick={handleUpdateService}>
                    Update
                  </Button>
                  <Button variant="outlined" onClick={() => setEditingService(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="contained" onClick={handleAddService}>
                  Add Service
                </Button>
              )}
            </div>
          </Card>

          <Card sx={{ p: 2 }} className="card service-list-card">
            {" "}
            {/* Added classes */}
            <Typography variant="h6" gutterBottom>
              Services List
            </Typography>
            {services.map((service) => (
              <Card key={service._id} className="service-card">
                {" "}
                {/* Replaced ServiceCard styled component */}
                <CardContent className="service-card-content">
                  {" "}
                  {/* Added class */}
                  <div>
                    <Typography variant="subtitle1">{service.name}</Typography>
                    <Typography variant="body2">
                      ${service.price} • {service.duration} hrs
                    </Typography>
                    {service.description && (
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    )}
                  </div>
                  <div className="service-card-actions">
                    {" "}
                    {/* Added class */}
                    <Button size="small" onClick={() => setEditingService(service)}>
                      Edit
                    </Button>
                    <Button size="small" color="error" onClick={() => handleDeleteService(service._id)}>
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </Card>
        </div>
        <div>
          <Card sx={{ p: 2, mb: 3 }} className="card">
            {" "}
            {/* Added .card class */}
            <div className="bookings-header">
              {" "}
              {/* Added class */}
              <Typography variant="h5">Bookings</Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by status</InputLabel>
                <Select value={filter} onChange={(e) => setFilter(e.target.value)} label="Filter by status">
                  <MenuItem value="all">All Bookings</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Ready for Delivery">Ready for Delivery</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </div>
          </Card>

          {filteredBookings.length === 0 ? (
            <Card sx={{ p: 2, textAlign: "center" }} className="card">
              {" "}
              {/* Added .card class */}
              <Typography>No bookings found</Typography>
            </Card>
          ) : (
            <div>
              {filteredBookings.map((b) => (
                <Card key={b._id} className={`booking-card status-${b.status.replace(/\s/g, "")}`}>
                  {" "}
                  {/* Replaced BookingCard styled component */}
                  <CardContent className="booking-card-content">
                    {" "}
                    {/* Added class */}
                    <div className="booking-card-header">
                      {" "}
                      {/* Added class */}
                      <Typography variant="subtitle1">{b.email}</Typography>
                      <Chip
                        label={b.status}
                        color={
                          b.status === "Pending"
                            ? "warning"
                            : b.status === "In Progress"
                              ? "info"
                              : b.status === "Ready for Delivery"
                                ? "success"
                                : "success"
                        }
                      />
                    </div>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {b.service}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booked on: {b.timestamp}
                    </Typography>
                    <Typography variant="body2">Service date: {b.bookingDate || b.date}</Typography>
                    <div className="booking-card-actions">
                      {" "}
                      {/* Added class */}
                      <Button size="small" onClick={() => handleViewBookingDetails(b)}>
                        View Details
                      </Button>
                      <FormControl sx={{ minWidth: 180 }}>
                        <Select
                          value={b.status}
                          onChange={(e) =>
                            handleStatusChange(
                              b._id,
                              e.target.value,
                              b.email,
                              b.service,
                              b.bookingDate || b.date,
                              b.phone,
                            )
                          } // Pass all necessary data
                          size="small"
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="In Progress">In Progress</MenuItem>
                          <MenuItem value="Ready for Delivery">Ready for Delivery</MenuItem>
                          <MenuItem value="Completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Dialog open={!!selectedBooking} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        {selectedBooking && (
          <>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedBooking.service}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Customer: {selectedBooking.name || selectedBooking.email}
              </Typography>
              {selectedBooking.phone && <Typography variant="body1">Phone: {selectedBooking.phone}</Typography>}
              {selectedBooking.address && <Typography variant="body1">Address: {selectedBooking.address}</Typography>}
              <Typography variant="body1">Date: {selectedBooking.bookingDate || selectedBooking.date}</Typography>
              <Typography variant="body1">Booked on: {selectedBooking.timestamp}</Typography>
              <Typography variant="body1">Status: {selectedBooking.status}</Typography>
              {selectedBooking.serviceDetails && (
                <div style={{ marginTop: "1rem" }}>
                  <Typography variant="subtitle2">Service Details:</Typography>
                  <Typography variant="body2">Price: ${selectedBooking.serviceDetails.price}</Typography>
                  <Typography variant="body2">Duration: {selectedBooking.serviceDetails.duration} hours</Typography>
                  {selectedBooking.serviceDetails.description && (
                    <Typography variant="body2">Description: {selectedBooking.serviceDetails.description}</Typography>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default OwnerDashboard
