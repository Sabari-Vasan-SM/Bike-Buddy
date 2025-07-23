import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from 'emailjs-com';
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
  DialogActions
} from '@mui/material';
import { styled } from '@mui/system';

const DashboardContainer = styled('div')({
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '2rem'
});

const ServiceCard = styled(Card)({
  marginBottom: '1rem',
  padding: '1rem',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }
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

function OwnerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newService, setNewService] = useState({ 
    name: '', 
    price: '', 
    duration: '', 
    description: '' 
  });
  const [editingService, setEditingService] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);


  useEffect(() => {
    if (!user || user.role !== 'owner') {
      navigate('/');
    } else {
      const loadData = async () => {
        try {
          const [bookingsRes, servicesRes] = await Promise.all([
            fetch('http://localhost:5000/api/bookings'),
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
    emailjs.init('eLnMDWQJUKn4i4CgN');
  }, [navigate, user]);


  // No need for localStorage event listener when using backend


  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(bookings => bookings.map((b) =>
          b.id === id ? { ...b, status: newStatus } : b
        ));
        const booking = bookings.find(b => b.id === id);
        if (newStatus === "Ready for Delivery" && booking?.email) {
          console.log(`Email sent to ${booking.email}: Your bike service is ready for delivery!`);
        }
        if (newStatus === "Completed" && booking?.email) {
          const templateParams = {
            user_email: booking.email,
            user_message: `Hi, your service for "${booking.service}" is ready for delivery!`,
            service_name: booking.service,
            service_date: booking.bookingDate || booking.date,
            customer_mobile: booking.mobile || ''
          };
          emailjs.send('service_2nqfc1z', 'template_gbxcdj8', templateParams)
            .then((res) => {
              console.log("Email successfully sent!", res.status, res.text);
            })
            .catch((err) => {
              console.error("Email send failed:", err);
            });
        }
      } else {
        alert('Failed to update booking status');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };


  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      alert('Please fill all required service fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      });
      if (res.ok) {
        const created = await res.json();
        setServices([...services, created]);
        setNewService({ name: '', price: '', duration: '', description: '' });
      } else {
        alert('Failed to add service');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };


  const handleUpdateService = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/services/${editingService._id || editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService)
      });
      if (res.ok) {
        const updated = await res.json();
        setServices(services.map(s => (s._id === updated._id || s.id === updated.id) ? updated : s));
        setEditingService(null);
      } else {
        alert('Failed to update service');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };


  const handleDeleteService = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/services/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setServices(services.filter(s => s._id !== id && s.id !== id));
      } else {
        alert('Failed to delete service');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <DashboardContainer>
      <Typography variant="h4" gutterBottom>
        Owner Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Manage services and bookings
      </Typography>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginTop: '2rem' }}>
        <div>
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Manage Services
            </Typography>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <TextField
                label="Service Name"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) => editingService 
                  ? setEditingService({...editingService, name: e.target.value})
                  : setNewService({...newService, name: e.target.value})}
                required
              />
              <TextField
                label="Price"
                value={editingService ? editingService.price : newService.price}
                onChange={(e) => editingService
                  ? setEditingService({...editingService, price: e.target.value})
                  : setNewService({...newService, price: e.target.value})}
                required
              />
              <TextField
                label="Duration (hours)"
                value={editingService ? editingService.duration : newService.duration}
                onChange={(e) => editingService
                  ? setEditingService({...editingService, duration: e.target.value})
                  : setNewService({...newService, duration: e.target.value})}
                required
              />
              <TextField
                label="Description"
                multiline
                rows={2}
                value={editingService ? editingService.description : newService.description}
                onChange={(e) => editingService
                  ? setEditingService({...editingService, description: e.target.value})
                  : setNewService({...newService, description: e.target.value})}
              />
              {editingService ? (
                <div style={{ display: 'flex', gap: '1rem' }}>
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

          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Services List
            </Typography>
            {services.map(service => (
              <ServiceCard key={service.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography variant="subtitle1">{service.name}</Typography>
                    <Typography variant="body2">${service.price} • {service.duration} hrs</Typography>
                    {service.description && (
                      <Typography variant="body2" color="text.secondary">
                        {service.description}
                      </Typography>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button 
                      size="small" 
                      onClick={() => setEditingService(service)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </ServiceCard>
            ))}
          </Card>
        </div>

        <div>
          <Card sx={{ p: 2, mb: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                Bookings
              </Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by status</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter by status"
                >
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
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <Typography>No bookings found</Typography>
            </Card>
          ) : (
            <div>
              {filteredBookings.map((b) => (
                <BookingCard key={b.id} status={b.status}>
                  <CardContent>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1">{b.email}</Typography>
                      <Chip 
                        label={b.status}
                        color={
                          b.status === 'Pending' ? 'warning' :
                          b.status === 'In Progress' ? 'info' :
                          b.status === 'Ready for Delivery' ? 'success' : 'success'
                        }
                      />
                    </div>
                    <Typography variant="h6" sx={{ mt: 1 }}>{b.service}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Booked on: {b.timestamp}
                    </Typography>
                    <Typography variant="body2">
                      Service date: {b.bookingDate || b.date}
                    </Typography>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                      <Button 
                        size="small" 
                        onClick={() => handleViewBookingDetails(b)}
                      >
                        View Details
                      </Button>
                      <FormControl sx={{ minWidth: 180 }}>
                        <Select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
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
                </BookingCard>
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
              {selectedBooking.phone && (
                <Typography variant="body1">
                  Phone: {selectedBooking.phone}
                </Typography>
              )}
              {selectedBooking.address && (
                <Typography variant="body1">
                  Address: {selectedBooking.address}
                </Typography>
              )}
              <Typography variant="body1">
                Date: {selectedBooking.bookingDate || selectedBooking.date}
              </Typography>
              <Typography variant="body1">
                Booked on: {selectedBooking.timestamp}
              </Typography>
              <Typography variant="body1">
                Status: {selectedBooking.status}
              </Typography>
              {selectedBooking.serviceDetails && (
                <div style={{ marginTop: '1rem' }}>
                  <Typography variant="subtitle2">Service Details:</Typography>
                  <Typography variant="body2">
                    Price: ${selectedBooking.serviceDetails.price}
                  </Typography>
                  <Typography variant="body2">
                    Duration: {selectedBooking.serviceDetails.duration} hours
                  </Typography>
                  {selectedBooking.serviceDetails.description && (
                    <Typography variant="body2">
                      Description: {selectedBooking.serviceDetails.description}
                    </Typography>
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
    </DashboardContainer>
  );
}

export default OwnerDashboard;