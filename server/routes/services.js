const express = require("express")
const router = express.Router()
const Service = require("../models/Service")

// GET all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find()
    res.json(services)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// POST create a new service
router.post("/", async (req, res) => {
  const { name, price, duration, description } = req.body
  if (!name || !price || !duration) {
    return res.status(400).json({ message: "Name, price, and duration are required" })
  }
  try {
    const service = new Service({ name, price, duration, description })
    await service.save()
    res.status(201).json(service)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// PUT update a service
router.put("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!service) return res.status(404).json({ message: "Service not found" })
    res.json(service)
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE a service
router.delete("/:id", async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) return res.status(404).json({ message: "Service not found" })
    res.json({ message: "Service deleted" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
