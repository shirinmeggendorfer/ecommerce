import React, { useState, useEffect } from 'react';

const AddCoupon = ({ closeForm, onCouponAdded }) => {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [discount, setDiscount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetch('http://localhost:4000/admincategories')
      .then(res => res.json())
      .then(data => setCategories(data));

    fetch('http://localhost:4000/admincollections')
      .then(res => res.json())
      .then(data => setCollections(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', image);

    const uploadRes = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData
    });
    const uploadData = await uploadRes.json();

    if (!uploadData.success) {
      alert('Failed to upload image');
      return;
    }

    const couponData = {
      name,
      discount,
      category_id: categoryId,
      collection_id: collectionId,
      image_url: uploadData.image_url
    };

    const res = await fetch('http://localhost:4000/addcoupon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(couponData)
    });

    const data = await res.json();
    if (data.success) {
      alert('Coupon added successfully');
      closeForm();
      onCouponAdded();
    } else {
      alert('Failed to add coupon');
    }
  };

  return (
    <div className="add-coupon-container">
      <h2>Add Coupon</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Coupon Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          required
        />
        <label htmlFor="category_id">Category</label>
        <select
          id="category_id"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select Category</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <label htmlFor="collection_id">Collection</label>
        <select
          id="collection_id"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          required
        >
          <option value="">Select Collection</option>
          {collections.map(collection => (
            <option key={collection.id} value={collection.id}>{collection.name}</option>
          ))}
        </select>
        <label htmlFor="coupon-image">Image</label>
        <input
          type="file"
          id="coupon-image"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCoupon;
