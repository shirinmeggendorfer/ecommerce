import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/LoginSignup.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    const response = await fetch('http://localhost:4001/adminlogin', { // Use admin login endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('auth-token', data.token);
      const userResponse = await fetch('http://localhost:4001/me', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });
      const userData = await userResponse.json();
      localStorage.setItem('is_admin', userData.is_admin);
      navigate('/dashboard');
    } else {
      alert('Login failed!');
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
