import React, { useState, useEffect } from 'react';

const AddCategory = () => {
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4000/admincategories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        setCategories([]);
      }
    };

    const fetchCollections = async () => {
      try {
        const res = await fetch('http://localhost:4000/admincollections');
        const data = await res.json();
        setCollections(Array.isArray(data) ? data : []);
      } catch (err) {
        setCollections([]);
      }
    };

    fetchCategories();
    fetchCollections();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/addCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });
      const result = await response.json();
      if (result.message === 'Category added successfully') {
        alert('Category added successfully');
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      alert('Failed to add category');
      console.error('Failed to add category:', error);
    }
  };

  return (
    <div className="add-category-container">
      <h2>Add Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Category Name"
          required
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCategory;
