// src/Components/FakePaymentButton.jsx
import React from 'react';

const FakePaymentButton = ({ amount, onSuccess }) => {
  const handlePayment = () => {
    console.log('Payment initiated'); // Log payment initiation
    // Simulate a successful payment after a delay
    setTimeout(() => {
      console.log('Payment successful'); // Log payment success
      onSuccess({ success: true, message: 'Payment processed successfully' });
    }, 1000); // 1-second delay for simulation
  };

  return (
    <button onClick={handlePayment}>
      Buy Now
    </button>
  );
};

export default FakePaymentButton;
