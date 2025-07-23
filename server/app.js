const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Basic route
test
app.get('/', (req, res) => {
  res.send('API is running');
});

// TODO: Add routes for users, cars, bookings

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
