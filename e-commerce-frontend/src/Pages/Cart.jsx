import React, { useContext } from 'react';
import { ShopContext } from '../Context/ShopContext';
import "./CSS/Cart.css";  // Stelle sicher, dass der Pfad korrekt ist
import { Link } from 'react-router-dom';

const Cart = () => {
  const { products, cartItems, addToCart, removeFromCart } = useContext(ShopContext);

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
                  <img onClick={() => window.scrollTo(0, 0)} src={`http://localhost:4001/images/${product.image}`} alt={product.name} />
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
    </div>
  );
};

export default Cart;
