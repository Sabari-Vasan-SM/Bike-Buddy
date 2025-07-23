import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip
} from '@mui/material';
import { styled } from '@mui/system';

const DashboardContainer = styled('div')({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem'
});

const BookingCard = styled(Card)(({ status }) => ({
  marginBottom: '1rem',
  borderLeft: `4px solid ${
    status === 'Pending' ? '#ffb74d' :
    status === 'In Progress' ? '#64b5f6' :
    status === 'Ready for Delivery' ? '#81c784' :
    '#a5d6a7'
  }`
}));

function CustomerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [bookings, setBookings] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/login');
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch(`http://localhost:5000/api/bookings?email=${user.email}`),
            fetch('http://localhost:5000/api/services')
          ]);
          const bookingsData = await bookingsRes.json();
          const servicesData = await servicesRes.json();
          setBookings(bookingsData);
          setServices(servicesData);
        } catch (err) {
          setBookings([]);
          setServices([]);
        }
      };
      loadData();
    }
  }, [navigate, user]);

  const handleOpenDialog = () => {
    if (!bookingDate || !selectedService) {
      alert('Please select a service and date');
      return;
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBook = async () => {
    const selectedServiceData = services.find(s => s.name === selectedService);
    const booking = {
      email: user.email,
      name: bookingDetails.name,
      phone: bookingDetails.phone,
      address: bookingDetails.address,
      service: selectedService,
      serviceDetails: selectedServiceData,
      date: bookingDate,
      status: 'Pending',
      timestamp: new Date().toLocaleString(),
      bookingDate: new Date(bookingDate).toLocaleDateString()
    };
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        const created = await res.json();
        setBookings([...bookings, created]);
        setSelectedService('');
        setBookingDate('');
        setBookingDetails({ name: '', phone: '', address: '' });
        setOpenDialog(false);
        alert(`Booking confirmed for ${selectedService} on ${booking.bookingDate}`);
      } else {
        alert('Failed to book service');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  // Notification polling logic can be handled by backend or websockets in future

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.email}
      </Typography>

      <Card sx={{ mb: 4, p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Book a Service
        </Typography>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <FormControl fullWidth sx={{ minWidth: 200 }}>
            <InputLabel>Select a service</InputLabel>
            <Select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              label="Select a service"
            >
              <MenuItem value="">Select a service</MenuItem>
              {services.map(service => (
                <MenuItem key={service.id} value={service.name}>
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
              min: new Date().toISOString().split('T')[0]
            }}
          />
          
          <Button
            variant="contained"
            onClick={handleOpenDialog}
            disabled={!selectedService || !bookingDate}
            sx={{ height: '56px' }}
          >
            Book Now
          </Button>
        </div>
      </Card>

      <Typography variant="h5" gutterBottom>
        Your Bookings
      </Typography>
      
      {bookings.length === 0 ? (
        <Card sx={{ p: 2, textAlign: 'center' }}>
          <Typography>No bookings yet. Book your first service!</Typography>
        </Card>
      ) : (
        <div>
          {bookings.map((b) => (
            <BookingCard key={b.id} status={b.status}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">{b.service}</Typography>
                  <Chip 
                    label={b.status}
                    color={
                      b.status === 'Pending' ? 'warning' :
                      b.status === 'In Progress' ? 'info' :
                      b.status === 'Ready for Delivery' ? 'success' : 'success'
                    }
                  />
                </div>
                <Typography variant="body2" color="text.secondary">
                  Date: {b.bookingDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Booked on: {b.timestamp}
                </Typography>
                <Typography variant="body2">
                  Price: ${b.serviceDetails?.price}
                </Typography>
                <Typography variant="body2">
                  Duration: {b.serviceDetails?.duration} hours
                </Typography>
                {b.status === 'Ready for Delivery' && (
                  <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#e8f5e9' }}>
                    <Typography variant="body2">
                      Your service is ready! Please collect your bike.
                    </Typography>
                  </div>
                )}
              </CardContent>
            </BookingCard>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
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
            value={bookingDetails.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="phone"
            label="Phone Number"
            type="tel"
            fullWidth
            variant="outlined"
            value={bookingDetails.phone}
            onChange={handleInputChange}
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
            value={bookingDetails.address}
            onChange={handleInputChange}
            required
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Service: {selectedService}
          </Typography>
          <Typography variant="subtitle1">
            Date: {new Date(bookingDate).toLocaleDateString()}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleBook} variant="contained" color="primary">
            Confirm Booking
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContainer>
  );
}

export default CustomerDashboard;