import React, { useContext, useState } from "react";
import "./ProductDisplay.css";
import { ShopContext } from "../../Context/ShopContext";
import { Link } from 'react-router-dom';

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [size, setSize] = useState('');

  const handleAddToCart = () => {
    if (!size) {
      alert('Please select a size.');
      return;
    }
    addToCart(product.id, size);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <img onClick={() => window.scrollTo(0, 0)} src={`http://localhost:4001/images/${product.image}`} alt="products" />
          </Link>
        </div>
        <div className="productdisplay-img">
          <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
            <img onClick={() => window.scrollTo(0, 0)} src={`http://localhost:4001/images/${product.image}`} alt="products" />
          </Link>
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-size">
          <h2>Select Size</h2>
          <div className="productdisplay-right-sizes">
            {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
              <div key={s} onClick={() => setSize(s)} className={`size-selector ${size === s ? 'selected' : ''}`}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <button onClick={handleAddToCart}>ADD TO CART</button>
      </div>
    </div>
  );
};

export default ProductDisplay;
