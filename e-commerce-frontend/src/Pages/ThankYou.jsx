
import React from 'react';
import { Link } from 'react-router-dom';
import './CSS/ThankYou.css';

const ThankYou = () => {
  return (
    <div className="thank-you-container">
      <h1>Thank you for your purchase!</h1>
      <p>Your order has been processed successfully.</p>
      <Link to="/" className="button">Continue Shopping</Link>
    </div>
  );
};

export default ThankYou;
