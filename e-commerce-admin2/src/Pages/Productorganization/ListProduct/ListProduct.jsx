import React, { useState, useEffect } from 'react';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    new_price: '',
    old_price: '',
    category_id: '',
    collection_id: '',
    image: null
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('new_price', newProduct.new_price);
      formData.append('old_price', newProduct.old_price);
      formData.append('category_id', newProduct.category_id);
      formData.append('collection_id', newProduct.collection_id);
      formData.append('image', newProduct.image);

      const response = await fetch('/addProduct', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.message === 'Product added successfully') {
        alert('Product added successfully');
        fetchProducts();
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Failed to add product');
      console.error('Failed to add product:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNewProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  return (
    <div className="list-product-container">
      <h2>List of Products</h2>
      <button className="add-product-button" onClick={() => document.querySelector('.add-product-container').style.display = 'block'}>
        Add New Product
      </button>
      <select>
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.name}>{category.name}</option>
        ))}
      </select>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <div className="product-info">
              {product.name} - ${product.price.toFixed(2)}
            </div>
            <div className="product-buttons">
              <button>Details</button>
              <button>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="add-product-container" style={{ display: 'none' }}>
        <h2>Add Product</h2>
        <form onSubmit={handleAddProduct}>
          <input
            name="name"
            placeholder="Product Name"
            required
            type="text"
            value={newProduct.name}
            onChange={handleInputChange}
          />
          <input
            name="new_price"
            placeholder="Product New Price"
            required
            step="0.01"
            type="number"
            value={newProduct.new_price}
            onChange={handleInputChange}
          />
          <input
            name="old_price"
            placeholder="Product Old Price"
            required
            step="0.01"
            type="number"
            value={newProduct.old_price}
            onChange={handleInputChange}
          />
          <label htmlFor="category_id">Category</label>
          <select
            id="category_id"
            name="category_id"
            required
            value={newProduct.category_id}
            onChange={handleInputChange}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <label htmlFor="collection_id">Collection</label>
          <select
            id="collection_id"
            name="collection_id"
            required
            value={newProduct.collection_id}
            onChange={handleInputChange}
          >
            <option value="">Select Collection</option>
            <option value="1">Collection 1</option>
          </select>
          <label htmlFor="product-image">Image</label>
          <input
            id="product-image"
            required
            type="file"
            onChange={handleFileChange}
          />
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default ListProduct;
