const mongoose = require("mongoose")
require("dotenv").config() // Load environment variables

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Use environment variable
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log("MongoDB connected successfully")
  } catch (err) {
    console.error("MongoDB connection error:", err)
    process.exit(1)
  }
}

module.exports = connectDB
