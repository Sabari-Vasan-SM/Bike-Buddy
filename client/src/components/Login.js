import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (role === 'owner') {
      if (email === 'owner@gmail.com' && password === 'owner') {
        localStorage.setItem('user', JSON.stringify({ role: 'owner' }));
        navigate('/owner');
      } else {
        alert('Invalid Owner Credentials');
      }
    } else {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find((u) => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('user', JSON.stringify({ role: 'customer', email }));
        navigate('/customer');
      } else {
        alert('Invalid Customer Credentials');
      }
    }
  };

  return (
    <div className="login-container">
      <img
        src="https://cdn-icons-png.flaticon.com/128/8598/8598957.png" // you can change to your own image
        alt="User Icon"
        className="login-image"
      />
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="role-switch">
          <select value={role} onChange={(e) => setRole(e.target.value)} className="pill-select">
            <option value="customer">Customer</option>
            <option value="owner">Owner</option>
          </select>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Register here</a></p>
    </div>
  );
}

export default Login;