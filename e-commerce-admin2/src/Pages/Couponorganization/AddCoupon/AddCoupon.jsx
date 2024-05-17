import React, { useState } from 'react';
import './AddCoupon.css';

const AddCoupon = ({ closeForm, onCouponAdded }) => {
  const [couponName, setCouponName] = useState('');
  const [amount, setAmount] = useState('');
  const [available, setAvailable] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setAvailable(checked);
    } else if (name === 'name') {
      setCouponName(value);
    } else if (name === 'amount') {
      setAmount(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4001/adminaddcoupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: couponName, amount, available })
      });
      const data = await response.json();
      if (data.success) {
        alert('Coupon added successfully');
        setCouponName(''); // Reset form
        setAmount('');
        setAvailable(false);
        if (closeForm) closeForm(); // Close form if the function is provided
        if (onCouponAdded) onCouponAdded(); // Refresh coupons if the function is provided
      } else {
        alert('Failed to add coupon');
      }
    } catch (error) {
      alert('Error submitting coupon');
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-coupon-container">
      <h2>Add Coupon</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={couponName}
          onChange={handleChange}
          placeholder="Coupon Name"
          required
        />
        <input
          type="number"
          name="amount"
          value={amount}
          onChange={handleChange}
          placeholder="Discount Amount (%)"
          required
        />
        <label>
          Available:
          <input
            type="checkbox"
            name="available"
            checked={available}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCoupon;
