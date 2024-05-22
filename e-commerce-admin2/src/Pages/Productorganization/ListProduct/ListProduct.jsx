import React, { useEffect, useState, useCallback } from 'react';
import ProductDetails from '../ProductDetails/ProductDetails';
import AddProduct from '../AddProduct/AddProduct';
import './ListProduct.css';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  const fetchProducts = useCallback(async () => {
    const url = `http://localhost:4000/allproductsadmin`;
    const response = await fetch(url);
    const data = await response.json();
    setProducts(data);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (productId) => {
    const response = await fetch(`http://localhost:4000/removeproduct/${productId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    if (data.success) {
      fetchProducts(); // Aktualisiert die Produktliste nach dem Löschen
      alert('Product deleted successfully');
    } else {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="list-product-container">
      <h2>List of Products</h2>
      <button className="add-product-button" onClick={() => setShowAddProduct(true)}>Add New Product</button>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <div className="product-info">
              {product.name} - ${product.new_price}
            </div>
            <div className="product-buttons">
              <button onClick={() => setSelectedProduct(product.id)}>Details</button>
              <button onClick={() => handleDelete(product.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {selectedProduct && <ProductDetails productId={selectedProduct} close={() => setSelectedProduct(null)} />}
      {showAddProduct && <AddProduct closeForm={() => setShowAddProduct(false)} onProductAdded={fetchProducts} />}
    </div>
  );
};

export default ListProduct;
