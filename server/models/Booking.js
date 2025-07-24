const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Customer's email
  name: { type: String, required: true }, // Customer's name
  phone: { type: String, required: true }, // Customer's phone
  address: { type: String, required: true }, // Customer's address
  service: { type: String, required: true }, // Name of the service booked
  serviceDetails: {
    // Details of the service at the time of booking
    name: String,
    price: Number,
    duration: Number,
    description: String,
  },
  date: { type: String, required: true }, // Original booking date (e.g., "YYYY-MM-DD")
  bookingDate: { type: String }, // Formatted booking date (e.g., "MM/DD/YYYY")
  status: { type: String, enum: ["Pending", "In Progress", "Ready for Delivery", "Completed"], default: "Pending" },
  timestamp: { type: String, default: () => new Date().toLocaleString() }, // When the booking was created
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model("Booking", BookingSchema)
