"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import LoadingScreen from "../LoadingScreen"
import {
  ArrowBack as BackIcon,
  Build as BuildIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material"

function ServicesManagement() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [newService, setNewService] = useState({
    name: "",
    price: "",
    duration: "",
    description: "",
  })
  const [editingService, setEditingService] = useState(null)

  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    document.body.appendChild(notification)

    setTimeout(() => {
      notification.remove()
    }, 4000)
  }

  useEffect(() => {
    if (!user || user.role !== "owner") {
      navigate("/")
    } else {
      const loadServices = async () => {
        try {
          const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/services")
          const servicesData = await res.json()
          setServices(servicesData)
        } catch (err) {
          console.error("Failed to load services:", err)
          setServices([])
          showNotification("Failed to load services. Please refresh the page.", "error")
        } finally {
          setTimeout(() => {
            setIsLoading(false)
          }, 1500)
        }
      }
      loadServices()
    }
  }, [navigate, user])

  const handleAddService = async () => {
    if (!newService.name || !newService.price || !newService.duration) {
      showNotification("Please fill all required service fields", "warning")
      return
    }
    try {
      const res = await fetch("https://cartrabbit-6qz5.onrender.com/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newService),
      })
      if (res.ok) {
        const created = await res.json()
        setServices((prev) => [...prev, created])
        setNewService({ name: "", price: "", duration: "", description: "" })
        showNotification("Service added successfully!", "success")
      } else {
        const errorText = await res.text()
        showNotification("Failed to add service: " + errorText, "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleUpdateService = async () => {
    try {
      const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/services/${editingService._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingService),
      })
      if (res.ok) {
        const updated = await res.json()
        setServices(services.map((s) => (s._id === updated._id ? updated : s)))
        setEditingService(null)
        showNotification("Service updated successfully!", "success")
      } else {
        showNotification("Failed to update service", "error")
      }
    } catch (err) {
      showNotification("Server error. Please try again later.", "error")
    }
  }

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        const res = await fetch(`https://cartrabbit-6qz5.onrender.com/api/services/${id}`, {
          method: "DELETE",
        })
        if (res.ok) {
          setServices(services.filter((s) => s._id !== id))
          showNotification("Service deleted successfully!", "success")
        } else {
          showNotification("Failed to delete service", "error")
        }
      } catch (err) {
        showNotification("Server error. Please try again later.", "error")
      }
    }
  }

  if (isLoading) {
    return <LoadingScreen type="owner" />
  }

  return (
    <div className="services-management">
      {/* Header */}
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate("/owner")}>
          <BackIcon />
          <span>Back to Dashboard</span>
        </button>
        <div className="header-content">
          <h1 className="page-title">
            <BuildIcon />
            Service Management
          </h1>
          <p className="page-subtitle">Manage your bike repair and maintenance services</p>
        </div>
      </div>

      {/* Add New Service Form */}
      <div className="service-form-section">
        <h2 className="section-title">
          <AddIcon />
          {editingService ? "Edit Service" : "Add New Service"}
        </h2>

        <div className="service-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Service Name *</label>
              <input
                className="form-input"
                placeholder="e.g., Basic Tune-up, Brake Repair"
                value={editingService ? editingService.name : newService.name}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, name: e.target.value })
                    : setNewService({ ...newService, name: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                className="form-input"
                type="number"
                placeholder="0.00"
                value={editingService ? editingService.price : newService.price}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, price: e.target.value })
                    : setNewService({ ...newService, price: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (hours) *</label>
              <input
                className="form-input"
                type="number"
                placeholder="1"
                value={editingService ? editingService.duration : newService.duration}
                onChange={(e) =>
                  editingService
                    ? setEditingService({ ...editingService, duration: e.target.value })
                    : setNewService({ ...newService, duration: e.target.value })
                }
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label className="form-label">Service Description</label>
            <textarea
              className="form-textarea"
              placeholder="Describe what's included in this service..."
              rows="4"
              value={editingService ? editingService.description : newService.description}
              onChange={(e) =>
                editingService
                  ? setEditingService({ ...editingService, description: e.target.value })
                  : setNewService({ ...newService, description: e.target.value })
              }
            />
          </div>

          <div className="form-actions">
            {editingService ? (
              <>
                <button className="btn btn-primary" onClick={handleUpdateService}>
                  <SaveIcon />
                  Update Service
                </button>
                <button className="btn btn-secondary" onClick={() => setEditingService(null)}>
                  <CancelIcon />
                  Cancel
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleAddService}>
                <AddIcon />
                Add Service
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="services-list-section">
        <h2 className="section-title">
          <BuildIcon />
          All Services ({services.length})
        </h2>

        {services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h3>No services added yet</h3>
            <p>Create your first bike service above to get started</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service._id} className="service-card">
                <div className="service-header">
                  <h3 className="service-name">{service.name}</h3>
                  <div className="service-price">₹{service.price}</div>
                </div>

                <div className="service-details">
                  <div className="service-duration">⏱️ {service.duration} hours</div>
                  {service.description && <p className="service-description">{service.description}</p>}
                </div>

                <div className="service-actions">
                  <button className="btn btn-sm btn-edit" onClick={() => setEditingService(service)}>
                    <EditIcon />
                    Edit
                  </button>
                  <button className="btn btn-sm btn-delete" onClick={() => handleDeleteService(service._id)}>
                    <DeleteIcon />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ServicesManagement
