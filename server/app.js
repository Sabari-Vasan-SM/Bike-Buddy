const express = require('express');
const connectDB = require('./config/db');
const corsMiddleware = require('./config/cors');

const app = express();

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// Connect to MongoDB
connectDB();

// Basic route
app.get('/', (req, res) => {
  res.send('API is running');
});


// Routes
app.use('/api/auth', require('./routes/auth'));
// TODO: Add routes for users, cars, bookings

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
