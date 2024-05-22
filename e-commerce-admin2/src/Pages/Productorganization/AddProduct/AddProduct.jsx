import React, { useState, useEffect } from 'react';
import './AddProduct.css';

const AddProduct = ({ closeForm, onProductAdded }) => {
  const [product, setProduct] = useState({
    name: '',
    new_price: '',
    old_price: '',
    category_id: '',
    collection_id: '',
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const res = await fetch('http://localhost:4000/admincategories');
      const data = await res.json();
      setCategories(data);
    };

    // Fetch collections
    const fetchCollections = async () => {
      const res = await fetch('http://localhost:4000/admincollections'); 
      const data = await res.json();
      setCollections(data);
    };

    fetchCategories();
    fetchCollections();
  }, []);

  const handleFileChange = (e) => {
    setProduct({ ...product, image: e.target.files[0] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('product', product.image);

      // Upload the image
      const uploadResponse = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      const uploadData = await uploadResponse.json();

      if (uploadData.success) {
        // Now add the product with the uploaded image URL
        const productResponse = await fetch('http://localhost:4000/addproduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: product.name,
            new_price: product.new_price,
            old_price: product.old_price,
            category_id: product.category_id,
            collection_id: product.collection_id,
            image: uploadData.image_url, // Use the URL from the upload response
          }),
        });
        if (!productResponse.ok) {
          throw new Error('Failed to add product');
        }
        const productData = await productResponse.json();

        if (productData.success) {
          alert('Product added successfully');
          setProduct({
            name: '',
            new_price: '',
            old_price: '',
            category_id: '',
            collection_id: '',
            image: null
          }); // Reset the form
          if (closeForm) closeForm(); // Close the form
          if (onProductAdded) onProductAdded(); // Call the callback to refresh the product list
        } else {
          alert('Failed to add product');
        }
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="add-product-container">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" required />
        <input type="number" name="new_price" value={product.new_price} onChange={handleChange} placeholder="Product New Price" step="0.01" required />
        <input type="number" name="old_price" value={product.old_price} onChange={handleChange} placeholder="Product Old Price" step="0.01" required />
        <select name="category_id"  value={product.category_id} onChange={handleChange} placeholder="Category" required>
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <select name="collection_id" value={product.collection_id} onChange={handleChange} placeholder="Collection" required>
          <option value="">Select Collection</option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>{collection.name}</option>
          ))}
        </select>
        <input type="file" onChange={handleFileChange} placeholder="Image" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddProduct;