// src/__tests__/Shop.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Shop from '../Pages/Shop';
import fetchMock from 'jest-fetch-mock';

// Mock dependent components
jest.mock('../Components/SearchBar/SearchBar', () => ({ onSearch }) => (
  <input
    placeholder="Search..."
    onChange={(e) => onSearch(e.target.value)}
  />
));
jest.mock('../Components/Hero/Hero', () => () => <div>Hero Component</div>);
jest.mock('../Components/Popular/Popular', () => ({ data }) => <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>);
jest.mock('../Components/Offers/Offers', () => () => <div>Offers Component</div>);
jest.mock('../Components/NewCollections/NewCollections', () => ({ data }) => <div>{data.map(item => <div key={item.id}>{item.name}</div>)}</div>);
jest.mock('../Components/NewsLetter/NewsLetter', () => () => <div>NewsLetter Component</div>);

const mockPopularData = [
  { id: 1, name: 'Popular Product 1', image: 'popular1.jpg' },
  { id: 2, name: 'Popular Product 2', image: 'popular2.jpg' },
];

const mockNewCollectionsData = [
  { id: 1, name: 'New Collection Product 1', image: 'newcollection1.jpg' },
  { id: 2, name: 'New Collection Product 2', image: 'newcollection2.jpg' },
];

const mockSearchResults = [
  { id: 3, name: 'Search Result Product 1', new_price: '30.00', image: 'search1.jpg' },
  { id: 4, name: 'Search Result Product 2', new_price: '40.00', image: 'search2.jpg' },
];

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.resetMocks();
});

const renderWithRouter = (ui) => {
  return render(
    <Router>
      {ui}
    </Router>
  );
};

describe('Shop component', () => {
  it('renders the Shop component with correct elements', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockPopularData), { status: 200 }],
      [JSON.stringify(mockNewCollectionsData), { status: 200 }]
    );

    renderWithRouter(<Shop />);

    expect(screen.getByText('Hero Component')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Popular Product 1')).toBeInTheDocument();
      expect(screen.getByText('Popular Product 2')).toBeInTheDocument();
      expect(screen.getByText('New Collection Product 1')).toBeInTheDocument();
      expect(screen.getByText('New Collection Product 2')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Offers Component')).toBeInTheDocument();
    expect(screen.getByText('NewsLetter Component')).toBeInTheDocument();
  });

  it('displays search results correctly', async () => {
    fetchMock.mockResponses(
      [JSON.stringify(mockPopularData), { status: 200 }],
      [JSON.stringify(mockNewCollectionsData), { status: 200 }],
      [JSON.stringify(mockSearchResults), { status: 200 }]
    );

    renderWithRouter(<Shop />);

    await waitFor(() => {
      expect(screen.getByText('Popular Product 1')).toBeInTheDocument();
      expect(screen.getByText('New Collection Product 1')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'Search' } });

    await waitFor(() => {
      expect(screen.getByText('Search Result Product 1')).toBeInTheDocument();
      expect(screen.getByText('Search Result Product 2')).toBeInTheDocument();
    });

    expect(screen.queryByText('Popular Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Offers Component')).not.toBeInTheDocument();
    expect(screen.queryByText('New Collection Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('NewsLetter Component')).not.toBeInTheDocument();
  });
});
