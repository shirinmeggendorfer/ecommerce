import React, { createContext, useEffect, useState } from "react";

export const ShopContext = createContext(null);

const ShopContextProvider = ({ children }) => {



  const fetchAllProducts = async () => {
    const res = await fetch('http://localhost:4000/allproducts');
    const data = await res.json();
    setProducts(data);
  };


  const addOrUpdateProduct = async (product) => {
    const method = product.id ? 'PUT' : 'POST';
    const url = product.id ? `http://localhost:4000/products/${product.id}` : 'http://localhost:4000/addproduct';

    await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem("auth-token"),
      },
      body: JSON.stringify(product)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Product update response:', data);
      fetchAllProducts(); // Refresh the product list
    })
    .catch(error => {
      console.error('Error updating product', error);
    });
  };

  const removeProduct = async (productId) => {
    await fetch(`http://localhost:4000/removeproduct/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem("auth-token"),
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log('Product removal response:', data);
      fetchAllProducts(); // Refresh the product list
    })
    .catch(error => console.error('Error removing product', error));
  };

  const contextValue = {
    products,
    cartItems,
    addOrUpdateProduct,
    removeProduct,
    fetchAllProducts,
    getTotalCartItems: () => Object.values(cartItems).reduce((total, item) => total + item.quantity, 0),
    getTotalCartAmount: () => Object.keys(cartItems).reduce((total, key) => {
      const product = products.find(p => p.id === parseInt(key));
      return total + (product ? product.new_price * cartItems[key].quantity : 0);
    }, 0)
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
