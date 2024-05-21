import React, { useEffect, useState, useCallback } from 'react';
import AddCategory from '../AddCategory/AddCategory';
import './ListCategory.css';

const ListCategory = () => {
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      const url = 'http://localhost:4000/admincategories';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEditCategory = async (id) => {
    if (!newCategoryName.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    const response = await fetch(`http://localhost:4000/adminupdatecategory/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newCategoryName })
    });
    if (response.ok) {
      fetchCategories(); // Refresh the list
      setEditCategoryId(null);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = async (id) => {
    const response = await fetch(`http://localhost:4000/admindeletecategory/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchCategories(); // Refresh the list
    }
  };

  return (
    <div className="list-category-container">
      <h2>List of Categories</h2>
      {error && <div className="error">Error: {error}</div>}
      <div className="button-wrapper">
        <button onClick={() => setShowAddCategory(true)}>Add New Category</button>
      </div>
      <ul>
        {categories.map(category => (
          <li key={category.id}>
            {editCategoryId === category.id ? (
              <input
                type="text"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onBlur={() => handleEditCategory(category.id)} // Save on blur
              />
            ) : (
              <>
                <span>{category.name}</span>
                <div className="button-group">
                  <button onClick={() => { setEditCategoryId(category.id); setNewCategoryName(category.name); }}>Edit</button>
                  <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {showAddCategory && (
        <AddCategory
          closeForm={() => setShowAddCategory(false)}
          onCategoryAdded={fetchCategories}
        />
      )}
    </div>
  );
};

export default ListCategory;
