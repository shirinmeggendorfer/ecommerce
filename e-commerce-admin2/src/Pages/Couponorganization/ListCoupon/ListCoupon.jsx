import React, { useEffect, useState, useCallback } from 'react';
import AddCoupon from '../AddCoupon/AddCoupon';
import './ListCoupon.css';

const ListCoupon = () => {
  const [coupons, setCoupons] = useState([]);
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [editCouponId, setEditCouponId] = useState(null);
  const [newCouponName, setNewCouponName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newAvailable, setNewAvailable] = useState(false);
  const [error, setError] = useState(null);

  const fetchCoupons = useCallback(async () => {
    try {
      const url = 'http://localhost:4001/admincoupons';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }
      const data = await response.json();
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCoupons([]);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleEditCoupon = async (id) => {
    if (!newCouponName.trim() || !newAmount.trim()) {
      alert('Coupon name and amount cannot be empty.');
      return;
    }
    const response = await fetch(`http://localhost:4001/adminupdatecoupon/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newCouponName, amount: newAmount, available: newAvailable })
    });
    if (response.ok) {
      fetchCoupons(); // Refresh the list
      setEditCouponId(null);
      setNewCouponName('');
      setNewAmount('');
      setNewAvailable(false);
    }
  };

  const handleDeleteCoupon = async (id) => {
    const response = await fetch(`http://localhost:4001/admindeletecoupon/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchCoupons(); // Refresh the list
    }
  };

  return (
    <div className="list-coupon-container">
      <h2>List of Coupons</h2>
      {error && <div className="error">Error: {error}</div>}
      <div className="button-wrapper">
        <button onClick={() => setShowAddCoupon(true)}>Add New Coupon</button>
      </div>
      <ul>
        {coupons.map(coupon => (
          <li key={coupon.id}>
            {editCouponId === coupon.id ? (
              <>
                <input
                  type="text"
                  value={newCouponName}
                  onChange={e => setNewCouponName(e.target.value)}
                  placeholder="Coupon Name"
                />
                <input
                  type="number"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="Discount Amount (%)"
                />
                <label>
                  Available:
                  <input
                    type="checkbox"
                    checked={newAvailable}
                    onChange={e => setNewAvailable(e.target.checked)}
                  />
                </label>
                <button onClick={() => handleEditCoupon(coupon.id)}>Save</button>
              </>
            ) : (
              <>
                <span>{coupon.name} - {coupon.amount}% {coupon.available ? '(Available)' : '(Not Available)'}</span>
                <div className="button-group">
                  <button onClick={() => {
                    setEditCouponId(coupon.id);
                    setNewCouponName(coupon.name);
                    setNewAmount(coupon.amount);
                    setNewAvailable(coupon.available);
                  }}>Edit</button>
                  <button onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {showAddCoupon && (
        <AddCoupon
          closeForm={() => setShowAddCoupon(false)}
          onCouponAdded={fetchCoupons}
        />
      )}
    </div>
  );
};

export default ListCoupon;
