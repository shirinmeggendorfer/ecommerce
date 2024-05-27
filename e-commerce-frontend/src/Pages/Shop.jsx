import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../Components/SearchBar/SearchBar';
import Hero from '../Components/Hero/Hero';
import Popular from '../Components/Popular/Popular';
import Offers from '../Components/Offers/Offers';
import NewCollections from '../Components/NewCollections/NewCollections';
import NewsLetter from '../Components/NewsLetter/NewsLetter';

const Shop = () => {
  const [popular, setPopular] = useState([]);
  const [newcollection, setNewCollection] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const fetchInfo = () => {
    fetch('http://localhost:4000/popularinwomen')
      .then((res) => res.json())
      .then((data) => setPopular(data));
    fetch('http://localhost:4000/newcollections')
      .then((res) => res.json())
      .then((data) => setNewCollection(data));
  };

  const handleSearch = (searchTerm) => {
    fetch(`http://localhost:4000/search?query=${encodeURIComponent(searchTerm)}`)
      .then(res => res.json())
      .then(data => setSearchResults(data))
      .catch(error => console.error('Error fetching search results:', error));
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div>
      <Hero />
      <SearchBar onSearch={handleSearch} />
      {searchResults.length > 0 ? (
        <div>
          <h2>Search Results</h2>
          {searchResults.map(product => (
            <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={`http://localhost:4000${product.image}`} alt={product.name} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
              <div>
                <p style={{ margin: 0 }}>{product.name}</p>
                <p style={{ margin: 0 }}>${product.new_price}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <>
          <Popular data={popular}/>
          <Offers/>
          <NewCollections data={newcollection}/>
          <NewsLetter/>
        </>
      )}
    </div>
  );
};

export default Shop;
