// src/Components/FakePaymentButton.jsx
import React, { useState } from 'react';

const FakePaymentButton = ({ amount, onSuccess }) => {
  const [showChecks, setShowChecks] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [proceed, setProceed] = useState(false);

  const handleBuyNowClick = () => {
    setShowChecks(true);
  };

  const handleCheckChange = (event) => {
    setSelectedCheck(event.target.name);
    setProceed(true);
  };

  const handlePayment = () => {
    if (selectedCheck) {
      onSuccess({ amount });
    }
  };

  return (
    <div>
      {!showChecks && (
        <button onClick={handleBuyNowClick}>Buy Now</button>
      )}
      {showChecks && (
        <div className="checks-container">
          <label>
            <input
              type="radio"
              name="check1"
              checked={selectedCheck === 'check1'}
              onChange={handleCheckChange}
            />
            Mastercard
          </label>
          <label>
            <input
              type="radio"
              name="check2"
              checked={selectedCheck === 'check2'}
              onChange={handleCheckChange}
            />
            Visa
          </label>
          <label>
            <input
              type="radio"
              name="check3"
              checked={selectedCheck === 'check3'}
              onChange={handleCheckChange}
            />
            Paypal
          </label>
        </div>
      )}
      {proceed && (
        <button onClick={handlePayment}>Proceed with Payment</button>
      )}
    </div>
  );
};

export default FakePaymentButton;
