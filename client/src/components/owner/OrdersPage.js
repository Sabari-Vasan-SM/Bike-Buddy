// Importing necessary modules and components
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

function OrdersPage() {
  // Hook to navigate programmatically
  const navigate = useNavigate();

  // State to store fetched orders and loading status
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect to fetch orders when the component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetching orders from the backend API
        const response = await fetch('https://cartrabbit-6qz5.onrender.com/api/bookings');
        const data = await response.json();
        setOrders(data); // Updating state with fetched orders
      } catch (error) {
        // Logging any errors that occur during the fetch
        console.error('Error fetching orders:', error);
      } finally {
        // Setting loading state to false after fetch completes
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Display a loading message while orders are being fetched
  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>All Orders</h1>
      {/* Display a message if no orders are found */}
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
          {/* Mapping through the orders and displaying each order's details */}
          {orders.map((order) => (
            <li key={order._id}>
              <p>Customer: {order.name || order.email}</p>
              <p>Service: {order.service}</p>
              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default OrdersPage;
