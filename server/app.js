const express = require("express")
const connectDB = require("./config/db")
const corsMiddleware = require("./config/cors")

const app = express()


// Middleware
app.use(express.json())

app.use(corsMiddleware)
// Handle preflight OPTIONS requests for all routes
app.options('*', corsMiddleware)

// Connect to MongoDB
connectDB()

// Basic route
app.get("/", (req, res) => {
  res.send("API is running")
})

// Routes
// Mount routes
app.use("/api/auth", require("./routes/auth")) // Ensure auth routes are mounted correctly
app.use("/api/services", require("./routes/services"))
app.use("/api/bookings", require("./routes/bookings")) // Added bookings route

// Error-handling middleware for debugging
app.use((err, req, res, next) => {
  console.error(err.message) // Log the error message
  res.status(500).json({ error: "Internal Server Error" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
