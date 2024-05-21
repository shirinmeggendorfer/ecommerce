// src/Context/ShopContext.js
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [totalCartItems, setTotalCartItems] = useState(0);
  const navigate = useNavigate();

  const token = localStorage.getItem("auth-token");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:4000/allproducts');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      if (token) {
        try {
          const res = await fetch('http://localhost:4000/getcart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            setCartItems(data);
            setTotalCartItems(Object.values(data).reduce((total, qty) => total + qty, 0));
          } else {
            throw new Error('Failed to fetch cart');
          }
        } catch (error) {
          console.error('Failed to fetch cart:', error);
          setCartItems({});
        }
      }
    };
    fetchCart();
  }, [token]);

  const addToCart = async (itemId, size) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch('http://localhost:4000/addtocart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId, size })
      });
      if (response.ok) {
        setCartItems(prevItems => {
          const itemKey = `${itemId}-${size}`;
          const newItems = { ...prevItems, [itemKey]: (prevItems[itemKey] || 0) + 1 };
          setTotalCartItems(Object.values(newItems).reduce((total, qty) => total + qty, 0));
          return newItems;
        });
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };



  const removeFromCart = async (itemId, size, removeAll = false) => {
    if (token) {
      try {
        const response = await fetch('http://localhost:4000/removefromcart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ itemId, size, removeAll })
        });
        if (response.ok) {
          setCartItems(prev => {
            const itemKey = `${itemId}-${size}`;
            if (removeAll) {
              const { [itemKey]: removed, ...rest } = prev;
              setTotalCartItems(Object.values(rest).reduce((total, qty) => total + qty, 0));
              return rest;
            } else {
              const newQuantity = (prev[itemKey] || 1) - 1;
              if (newQuantity > 0) {
                const newItems = { ...prev, [itemKey]: newQuantity };
                setTotalCartItems(Object.values(newItems).reduce((total, qty) => total + qty, 0));
                return newItems;
              } else {
                const { [itemKey]: removed, ...rest } = prev;
                setTotalCartItems(Object.values(rest).reduce((total, qty) => total + qty, 0));
                return rest;
              }
            }
          });
        } else {
          throw new Error('Failed to remove item from cart');
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    }
  };
  const clearCart = () => {
    setCartItems({});
  };

  const getTotalCartItems = () => token ? totalCartItems : 0;

  const contextValue = { products, cartItems, addToCart,clearCart, removeFromCart, getTotalCartItems, setCartItems };

  return <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>;
};

export { ShopContextProvider as ShopProvider };
export default ShopContextProvider;
