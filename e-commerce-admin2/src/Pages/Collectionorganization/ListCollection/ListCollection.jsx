import React, { useEffect, useState, useCallback } from 'react';
import AddCollection from '../AddCollection/AddCollection';
import './ListCollection.css';

const ListCollection = () => {
  const [collections, setCollections] = useState([]);
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [error, setError] = useState(null);

  const fetchCollections = useCallback(async () => {
    try {
      const url = 'http://localhost:4000/admincollections';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch collections');
      }
      const data = await response.json();
      setCollections(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setCollections([]);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleEditCollection = async (id) => {
    if (!newCollectionName.trim()) {
      alert('Collection name cannot be empty.');
      return;
    }
    const response = await fetch(`http://localhost:4000/adminupdatecollection/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: newCollectionName })
    });
    if (response.ok) {
      fetchCollections(); // Refresh the list
      setEditCollectionId(null);
      setNewCollectionName('');
    }
  };

  const handleDeleteCollection = async (id) => {
    const response = await fetch(`http://localhost:4000/admindeletecollection/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchCollections(); // Refresh the list
    }
  };

  return (
    <div className="list-collection-container">
      <h2>List of Collections</h2>
      {error && <div className="error">Error: {error}</div>}
      <div className="button-wrapper">
        <button onClick={() => setShowAddCollection(true)}>Add New Collection</button>
      </div>
      <ul>
        {collections.map(collection => (
          <li key={collection.id}>
            {editCollectionId === collection.id ? (
              <input
                type="text"
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                onBlur={() => handleEditCollection(collection.id)} // Save on blur
              />
            ) : (
              <>
                <span>{collection.name}</span>
                <div className="button-group">
                  <button onClick={() => { setEditCollectionId(collection.id); setNewCollectionName(collection.name); }}>Edit</button>
                  <button onClick={() => handleDeleteCollection(collection.id)}>Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {showAddCollection && (
        <AddCollection
          closeForm={() => setShowAddCollection(false)}
          onCollectionAdded={fetchCollections}
        />
      )}
    </div>
  );
};

export default ListCollection;