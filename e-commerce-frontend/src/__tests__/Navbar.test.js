import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import { act } from 'react';
import Navbar from '../Components/Navbar/Navbar';
import { ShopContext } from '../Context/ShopContext';

const mockContextValue = {
  getTotalCartItems: jest.fn(() => 5),
  setCartItems: jest.fn(),
};

describe('Navbar component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Navbar component with correct elements and logged out state', async () => {
    await act(async () => {
      render(
        <ShopContext.Provider value={mockContextValue}>
          <Router>
            <Navbar />
          </Router>
        </ShopContext.Provider>
      );
    });

    // Check that the logo and text are rendered correctly
    expect(screen.getByAltText('logo')).toBeInTheDocument();
    expect(screen.getByText('Get Your Need')).toBeInTheDocument();

    // Check that the navigation links are rendered correctly
    expect(screen.getByText('Shop')).toBeInTheDocument();
    expect(screen.getByText('Men')).toBeInTheDocument();
    expect(screen.getByText('Women')).toBeInTheDocument();
    expect(screen.getByText('Kids')).toBeInTheDocument();

    // Check that the login button is rendered correctly
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Check that the cart icon and count are rendered correctly
    expect(screen.getByAltText('Cart')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders Navbar component with logged in state and handles logout', async () => {
    localStorage.setItem('auth-token', 'test-token');

    await act(async () => {
      render(
        <ShopContext.Provider value={mockContextValue}>
          <Router>
            <Navbar />
          </Router>
        </ShopContext.Provider>
      );
    });

    // Check that the logout button is rendered correctly
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Check that the cart icon and count are rendered correctly
    expect(screen.getByAltText('Cart')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Mock fetch for logout
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );

    // Simulate logout click
    await act(async () => {
      fireEvent.click(screen.getByText('Logout'));
    });

    // Ensure fetch is called with correct arguments
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test-token`,
      },
    });

    // Ensure localStorage is cleared
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBeNull();
    });
  });

  it('toggles the dropdown menu', async () => {
    await act(async () => {
      render(
        <ShopContext.Provider value={mockContextValue}>
          <Router>
            <Navbar />
          </Router>
        </ShopContext.Provider>
      );
    });

    const dropdownIcon = screen.getByAltText('');
    fireEvent.click(dropdownIcon);

    const navMenu = document.querySelector('.nav-menu');
    expect(navMenu.classList.contains('nav-menu-visible')).toBe(true);

    fireEvent.click(dropdownIcon);
    expect(navMenu.classList.contains('nav-menu-visible')).toBe(false);
  });


});
