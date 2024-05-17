// Beispiel für eine einfache Login-Seite
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { setAuthToken } = useContext(ShopContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Authentifizierungslogik hier
    const response = await fetch('http://localhost:4001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.success) {
      setAuthToken(data.token);
      navigate('/admin');
    } else {
      alert('Login failed!');
    }
  };

  return (
    <div className='login'>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login;
