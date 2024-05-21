import React, { useState } from 'react';
import './AddCollection.css';

const AddCollection = ({ closeForm, onCollectionAdded }) => {
  const [collectionName, setCollectionName] = useState('');

  const handleChange = (e) => {
    setCollectionName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/adminaddcollection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: collectionName })
      });
      const data = await response.json();
      if (data.success) {
        alert('Collection added successfully');
        setCollectionName(''); // Reset form
        if (closeForm) closeForm(); // Close form if the function is provided
        if (onCollectionAdded) onCollectionAdded(); // Refresh collections if the function is provided
      } else {
        alert('Failed to add collection');
      }
    } catch (error) {
      alert('Error submitting collection');
      console.error('Error:', error);
    }
  };

  return (
    <div className="add-collection-container">
      <h2>Add Collection</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={collectionName}
          onChange={handleChange}
          placeholder="Collection Name"
          required
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddCollection;
