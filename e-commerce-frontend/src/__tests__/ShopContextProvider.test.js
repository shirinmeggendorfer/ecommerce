import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ShopProvider, ShopContext } from '../Context/ShopContext';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockFetch = (data, isError = false) =>
  jest.fn().mockImplementation(() =>
    isError
      ? Promise.reject(new Error('Fetch error'))
      : Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        })
  );

describe('ShopContextProvider', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches and sets products correctly', async () => {
    const products = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
    global.fetch = mockFetch(products);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await waitFor(() => expect(contextValue.products).toEqual(products));
  });

  it('handles product fetch errors gracefully', async () => {
    global.fetch = mockFetch({}, true);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await waitFor(() => expect(contextValue.products).toEqual([]));
  });

  it('fetches and sets cart correctly', async () => {
    const cartItems = { '1-M': 2 };
    global.fetch = mockFetch(cartItems);
    const mockToken = 'test-token';
    localStorage.setItem('auth-token', mockToken);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual(cartItems));
    await waitFor(() => expect(contextValue.getTotalCartItems()).toBe(2));
  });

  it('handles cart fetch errors gracefully', async () => {
    global.fetch = mockFetch({}, true);
    const mockToken = 'test-token';
    localStorage.setItem('auth-token', mockToken);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({}));
    await waitFor(() => expect(contextValue.getTotalCartItems()).toBe(0));
  });

  it('adds item to cart correctly', async () => {
    global.fetch = mockFetch({});
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    const mockToken = 'test-token';
    localStorage.setItem('auth-token', mockToken);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await act(async () => {
      contextValue.addToCart(1, 'M');
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({ '1-M': 1 }));
    await waitFor(() => expect(contextValue.getTotalCartItems()).toBe(1));
  });

  it('navigates to login if not authenticated when adding to cart', async () => {
    global.fetch = mockFetch({});
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    localStorage.removeItem('auth-token'); // Ensure no token is set

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await act(async () => {
      contextValue.addToCart(1, 'M');
    });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('removes item from cart correctly', async () => {
    global.fetch = mockFetch({});
    const mockToken = 'test-token';
    localStorage.setItem('auth-token', mockToken);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await act(async () => {
      contextValue.addToCart(1, 'M');
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({ '1-M': 1 }));
    await act(async () => {
      contextValue.removeFromCart(1, 'M');
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({}));
    expect(contextValue.getTotalCartItems()).toBe(0);
  });

  it('removes all items of a type from cart correctly', async () => {
    global.fetch = mockFetch({});
    const mockToken = 'test-token';
    localStorage.setItem('auth-token', mockToken);

    let contextValue;
    await act(async () => {
      render(
        <Router>
          <ShopProvider>
            <ShopContext.Consumer>
              {value => {
                contextValue = value;
                return null;
              }}
            </ShopContext.Consumer>
          </ShopProvider>
        </Router>
      );
    });

    await act(async () => {
      contextValue.addToCart(1, 'M');
      contextValue.addToCart(1, 'M');
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({ '1-M': 2 }));
    await act(async () => {
      contextValue.removeFromCart(1, 'M', true);
    });

    await waitFor(() => expect(contextValue.cartItems).toEqual({}));
    expect(contextValue.getTotalCartItems()).toBe(0);
  });

 
});
