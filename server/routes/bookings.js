const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");

// --------------------------
// Create SMTP transporter
// --------------------------
function createTransporter() {
  // 1) SendGrid (for Render / production)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: { user: "apikey", pass: process.env.SENDGRID_API_KEY },
    });
  }

  // 2) Gmail (local dev)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }

  return null;
}

// --------------------------
// GET all bookings
// --------------------------
router.get("/", async (req, res) => {
  try {
    const { email } = req.query;
    const bookings = email
      ? await Booking.find({ email }).sort({ createdAt: -1 })
      : await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --------------------------
// POST create a new booking
// --------------------------
router.post("/", async (req, res) => {
  const { email, name, phone, address, service, serviceDetails, date, status, timestamp, bookingDate } = req.body;
  if (!email || !name || !phone || !address || !service || !date) {
    return res.status(400).json({ message: "Missing required booking fields" });
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
    });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --------------------------
// PATCH update booking status
// --------------------------
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const bookingId = req.params.id;

  try {
    const booking = await Booking.findByIdAndUpdate(bookingId, { status }, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Send email for certain statuses
    const notifyStatuses = ["In Progress", "Ready for Delivery", "Completed"];
    if (notifyStatuses.includes(status) && booking.email) {
      const transporter = createTransporter();

      if (!transporter) {
        console.warn("No SMTP transporter configured - skipping email notification", booking._id);
      } else {
        // Prepare email
        let subject = "";
        let text = "";

        if (status === "In Progress") {
          subject = "Your Bike Service is In Progress";
          text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" is now in progress. Scheduled date: ${booking.bookingDate || booking.date}`;
        } else if (status === "Ready for Delivery") {
          subject = "Your Bike Service is Ready for Delivery!";
          text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" is ready for delivery! Scheduled date: ${booking.bookingDate || booking.date}`;
        } else if (status === "Completed") {
          subject = "Your Bike Service is Completed";
          text = `Hi ${booking.name || booking.email}, your service for "${booking.service}" has been completed. Thank you for choosing us!`;
        }

        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER || `no-reply@${process.env.APP_DOMAIN || "cartrabbit.local"}`,
          to: booking.email,
          subject,
          text,
        };

        // Send email asynchronously
        try {
          const info = await transporter.sendMail(mailOptions);
          console.log("Email sent:", info.response || info);
        } catch (err) {
          console.error("Error sending email:", err);
        }
      }
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// --------------------------
// DELETE a booking
// --------------------------
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
