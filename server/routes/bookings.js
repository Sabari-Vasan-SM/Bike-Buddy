const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")
const nodemailer = require("nodemailer")

// Helper: create an SMTP transporter with sensible timeouts and fallbacks.
// Priority:
// 1) SENDGRID_API_KEY (SMTP via SendGrid)
// 2) Explicit SMTP_HOST/SMTP_PORT (custom SMTP provider)
// 3) SMTP_USER/SMTP_PASS fallback (Gmail explicit settings)
// Returns null when no transporter config is provided so callers can skip sending.
function createTransporter() {
  // Prefer SendGrid (recommended for managed platforms where Gmail is blocked)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  }

  // Custom SMTP host/port (useful for other providers or relay services)
  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
      tls: { rejectUnauthorized: process.env.SMTP_TLS_REJECT !== "false" },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  }

  // Fallback: explicit Gmail settings (do not rely on nodemailer's `service` option
  // on platforms that block standard SMTP ports)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    })
  }

  // No transporter config — caller should skip email sending.
  return null
}

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

  // Send email if status is "In Progress", "Ready for Delivery", or "Completed"
  const notifyStatuses = ["In Progress", "Ready for Delivery", "Completed"]
  if (notifyStatuses.includes(status) && booking.email) {
    const transporter = createTransporter()
    if (!transporter) {
      console.warn("No SMTP transporter configured - skipping email notification for booking", booking._id)
    } else {
      // Customize subject and message based on status
      let subject = ""
      let text = ""
      if (status === "In Progress") {
        subject = "Your Bike Service is In Progress"
        text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" is now in progress. Scheduled date: ${booking.bookingDate || booking.date}`
      } else if (status === "Ready for Delivery") {
        subject = "Your Bike Service is Ready for Delivery!"
        text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" is ready for delivery! Scheduled date: ${booking.bookingDate || booking.date}`
      } else if (status === "Completed") {
        subject = "Your Bike Service is Completed"
        text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" has been completed. Thank you for choosing us!`
      }

      const mailOptions = {
        from: process.env.SMTP_USER || process.env.SMTP_FROM || `no-reply@${process.env.APP_DOMAIN || 'cartrabbit.local'}`,
        to: booking.email,
        subject,
        text,
      }

      try {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            // Log full error for debugging (ETIMEDOUT will appear here)
            console.error("Nodemailer sendMail error:", error)
          } else {
            console.log("Email sent:", info && info.response ? info.response : info)
          }
        })
      } catch (err) {
        console.error("Unexpected error when sending email:", err)
      }
    }
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


