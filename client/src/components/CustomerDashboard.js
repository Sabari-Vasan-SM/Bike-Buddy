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
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Chip,
  Divider,
  Box,
  Grid,
  Avatar,
  Paper,
  Stack,
  IconButton
} from "@mui/material"
import {
  DirectionsBike as BikeIcon,
  CalendarToday as CalendarIcon,
  SupportAgent as SupportIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Receipt as ReceiptIcon
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
          setBookings(await bookingsRes.json())
          setServices(await servicesRes.json())
        } catch (err) {
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "warning"
      case "In Progress": return "info"
      case "Ready for Delivery": return "success"
      default: return "primary"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Ready for Delivery": return <CheckCircleIcon />
      case "In Progress": return <ScheduleIcon />
      default: return <ReceiptIcon />
    }
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      {/* Welcome Section */}
      <Card sx={{ mb: 4, p: 3, borderRadius: 3, bgcolor: 'primary.light' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <BikeIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Welcome back, {user?.email.split('@')[0]}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Book and manage your bike services with ease
            </Typography>
          </Box>
        </Stack>
      </Card>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Book Service Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, height: '100%', borderRadius: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Book a Service
                </Typography>
              </Stack>
              <Divider />
              
              <FormControl fullWidth>
                <InputLabel>Select Service</InputLabel>
                <Select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  label="Select Service"
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
                inputProps={{ min: new Date().toISOString().split("T")[0] }}
                fullWidth
              />
              
              <Button
                variant="contained"
                size="large"
                onClick={handleOpenBookingDialog}
                disabled={!selectedService || !bookingDate}
                sx={{ py: 1.5 }}
              >
                Continue Booking
              </Button>
            </Stack>
          </Card>
        </Grid>

        {/* Bookings List Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3, borderRadius: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <InfoIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  Your Bookings
                </Typography>
              </Stack>
              <Divider />

              {bookings.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }}>
                  <Typography color="text.secondary">
                    No bookings yet. Book your first service!
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {bookings.map((booking) => (
                    <Paper key={booking._id} sx={{ p: 2, borderRadius: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={8}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {booking.service}
                            </Typography>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Chip
                                icon={getStatusIcon(booking.status)}
                                label={booking.status}
                                color={getStatusColor(booking.status)}
                                size="small"
                              />
                              <Typography variant="body2" color="text.secondary">
                                {booking.bookingDate}
                              </Typography>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewDetails(booking)}
                          >
                            View Details
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Support Section */}
      <Card sx={{ mt: 4, p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <SupportIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Need Help?
            </Typography>
          </Stack>
          <Divider />
          <Typography>
            Our support team is here to help with any questions about your bookings.
          </Typography>
          <Stack spacing={1}>
            <Typography>
              <strong>Email:</strong> support@cartrabbitbikeservice.com
            </Typography>
            <Typography>
              <strong>Phone:</strong> +1 (555) 123-4567
            </Typography>
          </Stack>
        </Stack>
      </Card>

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
                    ${services.find(s => s.name === selectedService)?.price || '0'}
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
                  startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />
                }}
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={bookingFormDetails.phone}
                onChange={handleBookingFormInputChange}
                InputProps={{
                  startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />
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
                  startAdornment: <HomeIcon color="action" sx={{ mr: 1, mt: -2, alignSelf: 'flex-start' }} />
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
                      ${selectedBookingDetails.serviceDetails?.price || '0'}
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
    </Box>
  )
}

export default CustomerDashboard