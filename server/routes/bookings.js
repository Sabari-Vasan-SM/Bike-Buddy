 const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")

// GET all bookings (with optional email filter for customer dashboard)
router.get("/", async (req, res) => {
  try {
    const { email } = req.query
    let bookings
    if (email) {
      bookings = await Booking.find({ email }).sort({ createdAt: -1 })
    } else {
      bookings = await Booking.find().sort({ createdAt: -1 })
    }
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// POST create a new booking
router.post("/", async (req, res) => {
  const { email, name, phone, address, service, serviceDetails, date, status, timestamp, bookingDate } = req.body
  if (!email || !name || !phone || !address || !service || !date) {
    return res.status(400).json({ message: "Missing required booking fields" })
  }
  try {
    const newBooking = new Booking({
      email,
      name,
      phone,
      address,
      service,
      serviceDetails,
      date,
      status,
      timestamp,
      bookingDate,
    })
    await newBooking.save()
    res.status(201).json(newBooking)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// PATCH update booking status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body
  if (!status) {
    return res.status(400).json({ message: "Status is required" })
  }
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json(booking)
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

module.exports = router
