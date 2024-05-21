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

  it('adds item to cart correctly', async () => {
    global.fetch = mockFetch({}, false);
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
    expect(contextValue.getTotalCartItems()).toBe(1);
  });

  it('removes item from cart correctly', async () => {
    global.fetch = mockFetch({}, false);
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

  it('handles fetch errors gracefully', async () => {
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
    expect(contextValue.cartItems).toEqual({});
  });
});
