import React, { useState } from 'react';
import './AddCategory.css';

const AddCategory = ({ closeForm, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState('');

  const handleChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4001/adminaddcategory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: categoryName })
      });
      const data = await response.json();
      if (data.success) {
        alert('Category added successfully');
        setCategoryName(''); // Zurücksetzen des Formulars
        if (closeForm) closeForm(); // Schließen des Formulars, wenn die Funktion übergeben wurde
        if (onCategoryAdded) onCategoryAdded(); // Neuladen der Kategorien
      } else {
        alert('Failed to add category');
      }
    } catch (error) {
      alert('Error submitting category');
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-category-container">
      <h2>Add Category</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={categoryName}
          onChange={handleChange}
          placeholder="Category Name"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCategory;