import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { ShopContext } from '../../Context/ShopContext';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const contextValue = {
  getTotalCartItems: jest.fn(() => 5),
  setCartItems: jest.fn()
};

test('renders Navbar component', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ShopContext.Provider value={contextValue}>
        <Navbar />
      </ShopContext.Provider>
    </MemoryRouter>
  );
  expect(getByText('Get Your Need')).toBeInTheDocument();
  expect(getByText('Shop')).toBeInTheDocument();
});

test('logout button click', () => {
  localStorage.setItem('auth-token', 'test-token');
  const { getByText } = render(
    <MemoryRouter>
      <ShopContext.Provider value={contextValue}>
        <Navbar />
      </ShopContext.Provider>
    </MemoryRouter>
  );

  fireEvent.click(getByText('Logout'));
  expect(localStorage.getItem('auth-token')).toBeNull();
});
