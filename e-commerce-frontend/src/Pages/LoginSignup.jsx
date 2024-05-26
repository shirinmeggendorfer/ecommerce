import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CSS/LoginSignup.css";

const LoginSignup = () => {
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isSignupPage = location.pathname === "/signup";

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  const login = async () => {
    let dataObj;
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }), // Only send email and password for login
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      dataObj = data;
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        navigate("/"); // Redirect using navigate
      } else {
        alert(dataObj.errors);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while trying to login.');
    }
  };

  const signup = async () => {
    if (!isChecked) {
      alert("You must agree to the terms and conditions to sign up.");
      return;
    }

    let dataObj;
    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      dataObj = data;
      if (dataObj.success) {
        localStorage.setItem('auth-token', dataObj.token);
        navigate("/"); // Redirect using navigate
      } else {
        alert(dataObj.errors);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while trying to sign up.');
    }
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{isSignupPage ? "Sign Up" : "Login"}</h1>
        <div className="loginsignup-fields">
          {isSignupPage && (
            <input
              type="text"
              placeholder="Your name"
              name="username"
              value={formData.username}
              onChange={changeHandler}
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            name="email"
            value={formData.email}
            onChange={changeHandler}
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={changeHandler}
          />
        </div>
  
        <button onClick={isSignupPage ? signup : login}>Continue</button>
  
        {isSignupPage ? (
          <p className="loginsignup-login">
            Already have an account? <span onClick={goToLogin}>Login here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account? <span onClick={goToSignup}>Click here</span>
          </p>
        )}
  
        {isSignupPage && (
          <div className="loginsignup-agree">
            <input 
              type="checkbox" 
              name="terms" 
              id="terms" 
              checked={isChecked} 
              onChange={handleCheckboxChange} 
            />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginSignup;
