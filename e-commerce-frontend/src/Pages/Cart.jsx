// src/Pages/Cart.jsx
import React, { useContext, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import './CSS/Cart.css';
import { Link, useNavigate } from 'react-router-dom';
import FakePaymentButton from '../Components/FakePaymentButton';
import Loading from '../Components/Loading/Loading.jsx';

const Cart = () => {
  const { products, cartItems, addToCart, removeFromCart, setCartItems , clearCart} = useContext(ShopContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalAmount = Object.keys(cartItems).reduce((total, key) => {
    const [id] = key.split('-');
    const quantity = cartItems[key];
    const product = products.find(p => p.id === parseInt(id));
    if (product) {
      const price = parseFloat(product.new_price);
      return total + (isNaN(price) ? 0 : price * quantity);
    }
    return total;
  }, 0).toFixed(2);

  const handleSuccessPayment = (details) => {
    console.log('Payment Success:', details);
    setLoading(true);
    setCartItems({}); // Leert den Warenkorb
    clearCart();
    setTimeout(() => {
      setLoading(false);
      navigate('/thank-you');
    }, 2000); // Simulieren des Ladevorgangs für 2 Sekunden vor der Weiterleitung
  };

  return (
    <div className="cart-container">
      <h1>Your Shopping Cart</h1>
      <hr />
      <div className="cart-items">
        {Object.keys(cartItems).map((key) => {
          const [id, size] = key.split('-');
          const quantity = cartItems[key];
          const product = products.find(p => p.id === parseInt(id));
          if (product) {
            const price = parseFloat(product.new_price);
            return (
              <div key={key} className="cart-item">
                <Link to={`/product/${product.id}`} className="cart-item-image" style={{ textDecoration: 'none' }}>
                  <img onClick={() => window.scrollTo(0, 0)} src={`http://localhost:4000/images/${product.image}`} alt={product.name} />
                </Link>
                <div className="cart-item-details">
                  <p>{product.name}</p>
                  <p>Size: {size}</p>
                  <p>${isNaN(price) ? '0.00' : price.toFixed(2)}</p>
                  <div className="quantity-control">
                    <button onClick={() => removeFromCart(id, size)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => addToCart(id, size)}>+</button>
                  </div>
                  <p>Total: ${isNaN(price) ? '0.00' : (price * quantity).toFixed(2)}</p>
                  <button onClick={() => removeFromCart(id, size, true)} className="remove-item">Remove</button>
                </div>
              </div>
            );
          } else {
            return <div key={key} className="cart-item">Product not found or price missing</div>;
          }
        })}
      </div>
      <hr />
      <div className="total-amount">
        <h2>Total Amount: ${totalAmount}</h2>
      </div>
      <FakePaymentButton amount={totalAmount} onSuccess={handleSuccessPayment} />
      {loading && <div className="loading-overlay"><Loading /></div>}
    </div>
  );
};

export default Cart;
