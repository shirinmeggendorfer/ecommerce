import React, { useContext } from "react";
import "./CartItems.css";
import cross_icon from "../Assets/cart_cross_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import { Link } from 'react-router-dom';

const CartItems = () => {
  const { products, cartItems, removeFromCart, getTotalCartAmount, addToCart } = useContext(ShopContext);

  return (
    <div className="cartitems">
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {Object.keys(cartItems).map(key => {
        const [id, size] = key.split('-');
        const product = products.find(e => e.id === Number(id));
        return (
          <div key={key}>
            <div className="cartitems-format-main cartitems-format">
                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                  <img 
                    onClick={() => window.scrollTo(0, 0)} 
                    src={`http://localhost:4000${product.image}`} 
                    alt="products" 
                    className="cartitems-product-icon"  // Stelle sicher, dass diese Klasse im CSS definiert ist
                  />
                </Link>

              <p>{product.name}</p>
              <p>${parseFloat(product.new_price).toFixed(2)}</p>
              <div className="quantity-control">
                <button onClick={() => removeFromCart(product.id, size)}>-</button>
                <span>{cartItems[key]}</span>
                <button onClick={() => addToCart(product.id, size)}>+</button>
              </div>
              <p>${(product.new_price * cartItems[key]).toFixed(2)}</p>
              <img onClick={() => removeFromCart(product.id, size, true)} className="cartitems-remove-icon" src={cross_icon} alt="Remove" />
            </div>
            <hr />
          </div>
        );
      })}

      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Totals</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${getTotalCartAmount().toFixed(2)}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount().toFixed(2)}</h3>
            </div>
          </div>
          <button>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promo code, Enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder="promo code" />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
