import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://cartrabbit-6qz5.onrender.com/api/bookings');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <h1>All Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <ul>
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
