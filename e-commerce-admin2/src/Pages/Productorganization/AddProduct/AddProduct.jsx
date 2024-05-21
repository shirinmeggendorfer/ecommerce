import React, { useState } from 'react';

const AddProduct = () => {
  const [product, setProduct] = useState({
    name: '',
    new_price: '',
    old_price: '',
    category_id: '',
    collection_id: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleFileChange = (e) => {
    setProduct({ ...product, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('new_price', product.new_price);
      formData.append('old_price', product.old_price);
      formData.append('category_id', product.category_id);
      formData.append('collection_id', product.collection_id);
      formData.append('image', product.image);

      const response = await fetch('/addProduct', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.message === 'Product added successfully') {
        alert('Product added successfully');
      } else {
        alert('Failed to add product');
      }
    } catch (error) {
      alert('Failed to add product');
      console.error('Failed to add product:', error);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Product Name"
          required
          type="text"
          value={product.name}
          onChange={handleChange}
        />
        <input
          name="new_price"
          placeholder="Product New Price"
          required
          step="0.01"
          type="number"
          value={product.new_price}
          onChange={handleChange}
        />
        <input
          name="old_price"
          placeholder="Product Old Price"
          required
          step="0.01"
          type="number"
          value={product.old_price}
          onChange={handleChange}
        />
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          name="category_id"
          required
          value={product.category_id}
          onChange={handleChange}
        >
          <option value="">Select Category</option>
          <option value="1">Category 1</option>
          <option value="2">Category 2</option>
        </select>
        <label htmlFor="collection_id">Collection</label>
        <select
          id="collection_id"
          name="collection_id"
          required
          value={product.collection_id}
          onChange={handleChange}
        >
          <option value="">Select Collection</option>
          <option value="1">Collection 1</option>
          <option value="2">Collection 2</option>
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
  );
};

export default AddProduct;
