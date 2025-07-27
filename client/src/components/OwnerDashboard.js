"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
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
  const [searchTerm, setSearchTerm] = useState("") // New state for search

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
            (b) => (b._id === id ? { ...b, status: newStatus } : b),
          ),
        )
        // Email will now be sent by backend
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
    if (window.confirm("Are you sure you want to delete this service?")) {
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
  }

  const handleDeleteBooking = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      try {
        const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setBookings(bookings.filter((b) => b._id !== id))
          setSelectedBooking(null) // Close dialog if open for deleted booking
        } else {
          alert("Failed to delete booking")
        }
      } catch (err) {
        alert("Server error. Please try again later.")
      }
    }
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

  return (
    <div className="owner-dashboard-container">
      <Typography variant="h4" gutterBottom sx={{ color: "var(--primary-color)", fontWeight: 600 }}>
        Owner Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage services and bookings efficiently.
      </Typography>

      {/* Dashboard Overview */}
      <Card className="card dashboard-overview-card" sx={{ backgroundColor: "#fff" }}>
        <Typography variant="h5" gutterBottom sx={{ color: "black", fontWeight: 600 }}>
          Dashboard Overview
        </Typography>
        <div className="overview-grid">
          <div className="overview-item" style={{ background: "#fff" }}>
            <Typography variant="h6" sx={{ color: "black !important", fontWeight: 700 }}>{totalServices}</Typography>
            <Typography variant="body1" sx={{ color: "black !important", opacity: 0.85 }}>Total Services</Typography>
          </div>
          <div className="overview-item" style={{ background: "#fff" }}>
            <Typography variant="h6" sx={{ color: "black !important", fontWeight: 700 }}>{totalBookings}</Typography>
            <Typography variant="body1" sx={{ color: "black !important", opacity: 0.85 }}>Total Bookings</Typography>
          </div>
          <div className="overview-item" style={{ background: "#fff" }}>
            <Typography variant="h6" sx={{ color: "black !important", fontWeight: 700 }}>{pendingBookings}</Typography>
            <Typography variant="body1" sx={{ color: "black !important", opacity: 0.85 }}>Pending Bookings</Typography>
          </div>
        </div>
      </Card>

      <div className="owner-dashboard-grid">
        <div>
          <Card className="card section-card">
            <Typography variant="h5" gutterBottom sx={{ color: "var(--text-dark)" }}>
              Manage Services
            </Typography>

            <div className="service-form-fields">
              <TextField
                label="Service Name"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, name: e.target.value })
                    : setNewService({ ...newService, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Price"
                type="number"
                value={editingService ? editingService.price : newService.price}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, price: e.target.value })
                    : setNewService({ ...newService, price: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Duration (hours)"
                type="number"
                value={editingService ? editingService.duration : newService.duration}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, duration: e.target.value })
                    : setNewService({ ...newService, duration: e.target.value })
                }
                required
                fullWidth
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
                fullWidth
              />
              {editingService ? (
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <Button variant="contained" onClick={handleUpdateService} sx={{ flex: 1 }}>
                    Update Service
                  </Button>
                  <Button variant="outlined" onClick={() => setEditingService(null)} sx={{ flex: 1 }}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button variant="contained" onClick={handleAddService} sx={{ marginTop: "1rem" }}>
                  Add New Service
                </Button>
              )}
            </div>
          </Card>

          <Card className="card section-card">
            <Typography variant="h6" gutterBottom sx={{ color: "var(--text-dark)" }}>
              Services List
            </Typography>
            {services.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No services added yet.
              </Typography>
            ) : (
              <div>
                {services.map((service, index) => (
                  <Card key={service._id} className="service-card" sx={{ animationDelay: `${index * 0.05}s` }}>
                    <CardContent className="service-card-content">
                      <div>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                          {service.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ${service.price} • {service.duration} hrs
                        </Typography>
                        {service.description && (
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                        )}
                      </div>
                      <div className="service-card-actions">
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
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="card section-card">
            <div className="bookings-header">
              <Typography variant="h5" sx={{ color: "var(--text-dark)" }}>
                Bookings
              </Typography>
              <FormControl sx={{ minWidth: 180 }}>
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
            {/* Search Input */}
            <TextField
              label="Search by Email, Name, or Service"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
              className="search-input"
            />

            {filteredBookings.length === 0 ? (
              <Card sx={{ p: 2, textAlign: "center" }} className="card">
                <Typography>No bookings found for the current filter/search.</Typography>
              </Card>
            ) : (
              <div>
                {filteredBookings.map((b, index) => (
                  <Card
                    key={b._id}
                    className={`booking-card status-${b.status.replace(/\s/g, "")}`}
                    sx={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="booking-card-content">
                      <div className="booking-card-header">
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                          {b.email}
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
                                  : "primary"
                          }
                          sx={{ fontWeight: "bold" }}
                        />
                      </div>
                      <Typography variant="h6" sx={{ mt: 1, color: "var(--text-dark)" }}>
                        {b.service}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Booked on: {b.timestamp}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Service date: {b.bookingDate || b.date}
                      </Typography>
                      <div className="booking-card-actions">
                        <Button size="small" variant="outlined" onClick={() => handleViewBookingDetails(b)}>
                          View Details
                        </Button>
                        <FormControl sx={{ minWidth: 150 }}>
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
                        <Button size="small" color="error" onClick={() => handleDeleteBooking(b._id)}>
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

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
                  <Typography variant="body2">Price: ₹{selectedBooking.serviceDetails.price}</Typography>
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
