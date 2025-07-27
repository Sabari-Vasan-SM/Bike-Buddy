const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")
const nodemailer = require("nodemailer")

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
  const bookingId = req.params.id
  // Find booking and update status
  const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true })
  if (!booking) return res.status(404).send("Booking not found")

  // Send email if status is "Ready for Delivery"
  if (status === "Ready for Delivery" && booking.email) {
    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // or your SMTP
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Email options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: booking.email,
      subject: "Your Bike Service is Ready for Delivery!",
      text: `Hi ${booking.name || booking.email}, your service for "${booking.service}" is ready for delivery! Scheduled date: ${booking.bookingDate || booking.date}`,
    }

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Nodemailer error:", error); // Check your terminal for this!
      } else {
        console.log("Email sent:", info.response);
      }
    })
  }

  res.json(booking)
})

// DELETE a booking (New)
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json({ message: "Booking deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

module.exports = router


