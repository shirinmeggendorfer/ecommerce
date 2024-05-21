import React, { useState, useEffect } from 'react';

const ProductDetails = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoriesRes, collectionsRes] = await Promise.all([
          fetch(`http://localhost:4000/products/${productId}`),
          fetch('http://localhost:4000/categories'),
          fetch('http://localhost:4000/collections')
        ]);

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();
        const collectionsData = await collectionsRes.json();

        setProduct(productData);
        setCategories(categoriesData);
        setCollections(collectionsData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    fetchData();
  }, [productId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:4000/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      alert('Product updated successfully');
    } catch (error) {
      alert('Failed to update product');
    }
  };

  return (
    <div className="product-details-container">
      <h2>Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          placeholder="Product Name"
          type="text"
          value={product.name}
          onChange={handleChange}
        />
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          name="category_id"
          value={product.category_id}
          onChange={handleChange}
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
          value={product.collection_id}
          onChange={handleChange}
        >
          <option value="">Select Collection</option>
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.name}
            </option>
          ))}
        </select>
        <label htmlFor="new_price">New Price</label>
        <input
          id="new_price"
          name="new_price"
          placeholder="New Price"
          type="number"
          value={product.new_price}
          onChange={handleChange}
        />
        <label htmlFor="old_price">Old Price</label>
        <input
          id="old_price"
          name="old_price"
          placeholder="Old Price"
          type="number"
          value={product.old_price}
          onChange={handleChange}
        />
        <label htmlFor="image">Image</label>
        <input
          id="image"
          name="image"
          type="file"
        />
        <button type="submit">Update Product</button>
        <button type="button" onClick={() => alert('Form closed')}>Close</button>
      </form>
    </div>
  );
};

export default ProductDetails;
