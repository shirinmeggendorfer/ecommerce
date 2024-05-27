import React, { useEffect, useState } from 'react';
import './ProductDetails.css';

const ProductDetails = ({ productId, close }) => {
  const [product, setProduct] = useState({
    name: '',
    category_id: '',
    collection_id: '',
    new_price: '',
    old_price: '',
    image: null
  });
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategoriesAndCollections = async () => {
      try {
        const catRes = await fetch('http://localhost:4000/admincategories');
        const colRes = await fetch('http://localhost:4000/admincollections');
        if (!catRes.ok || !colRes.ok) {
          throw new Error('Failed to fetch');
        }
        const catData = await catRes.json();
        const colData = await colRes.json();
        setCategories(catData);
        setCollections(colData);
      } catch (error) {
        console.error('Failed to load categories or collections:', error);
      }
    };

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:4000/productadmin/${productId}`);
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        setProduct({ ...data, category_id: data.category_id, collection_id: data.collection_id });
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndCollections();
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProduct({ ...product, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('category_id', product.category_id);
    formData.append('collection_id', product.collection_id);
    formData.append('new_price', product.new_price);
    formData.append('old_price', product.old_price);
    if (product.image) {
      formData.append('product', product.image);  // Hier sicherstellen, dass der Name 'product' ist
    }
  
    try {
      const response = await fetch(`http://localhost:4000/updateproductadmin/${productId}`, {
        method: 'PUT',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert('Product updated successfully!');
        close();
      } else {
        alert('Failed to update product.');
      }
    } catch (error) {
      alert('Failed to update product.');
    }
  };
  
  

  if (loading) return <p>Loading...</p>;
  if (!product) return null;

  return (
    <div className="product-details-container">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" value={product.name} onChange={handleChange} placeholder="Product Name" />

        <label htmlFor="category_id">Category</label>
        <select id="category_id" name="category_id" value={product.category_id} onChange={handleChange}>
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        <label htmlFor="collection_id">Collection</label>
        <select id="collection_id" name="collection_id" value={product.collection_id} onChange={handleChange}>
          <option value="">Select Collection</option>
          {collections.map(col => (
            <option key={col.id} value={col.id}>{col.name}</option>
          ))}
        </select>

        <label htmlFor="new_price">New Price</label>
        <input type="number" id="new_price" name="new_price" value={product.new_price} onChange={handleChange} placeholder="New Price" />

        <label htmlFor="old_price">Old Price</label>
        <input type="number" id="old_price" name="old_price" value={product.old_price} onChange={handleChange} placeholder="Old Price" />

        <label htmlFor="image">Image</label>
        <input type="file" onChange={handleFileChange} placeholder="Image" />

        <button type="submit">Update Product</button>
        <button type="button" onClick={close}>Close</button>
      </form>
    </div>
  );
};

export default ProductDetails;
