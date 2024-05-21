import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ShopProvider, ShopContext } from '../ShopContext';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const mockFetch = (data, ok = true) => jest.fn(() =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(data)
  })
);

describe('ShopContext', () => {
  beforeEach(() => {
    global.fetch = mockFetch([]);
    localStorage.setItem('auth-token', 'test-token');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches products on mount', async () => {
    const mockProducts = [{ id: 1, name: 'Test Product' }];
    global.fetch = mockFetch(mockProducts);

    const TestComponent = () => {
      const { products } = React.useContext(ShopContext);
      return (
        <div>
          {products.map(product => (
            <p key={product.id}>{product.name}</p>
          ))}
        </div>
      );
    };

    const { getByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('fetches cart items on mount when token exists', async () => {
    const mockCartItems = { '1-S': 2 };
    global.fetch = mockFetch(mockCartItems);

    const TestComponent = () => {
      const { cartItems } = React.useContext(ShopContext);
      return (
        <div>
          {Object.entries(cartItems).map(([key, qty]) => (
            <p key={key}>{key}: {qty}</p>
          ))}
        </div>
      );
    };

    const { getByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(getByText('1-S: 2')).toBeInTheDocument();
    });
  });

  test('adds item to cart', async () => {
    const mockProducts = [{ id: 1, name: 'Test Product' }];
    global.fetch = mockFetch(mockProducts);

    const TestComponent = () => {
      const { addToCart, cartItems } = React.useContext(ShopContext);
      React.useEffect(() => {
        addToCart(1, 'M');
      }, [addToCart]);
      return (
        <div>
          {Object.entries(cartItems).map(([key, qty]) => (
            <p key={key}>{key}: {qty}</p>
          ))}
        </div>
      );
    };

    const { getByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(getByText('1-M: 1')).toBeInTheDocument();
    });
  });

  test('removes item from cart', async () => {
    const mockCartItems = { '1-S': 2 };
    global.fetch = mockFetch(mockCartItems);

    const TestComponent = () => {
      const { removeFromCart, cartItems, setCartItems } = React.useContext(ShopContext);
      React.useEffect(() => {
        setCartItems(mockCartItems);
        removeFromCart(1, 'S');
      }, [removeFromCart, setCartItems]);
      return (
        <div>
          {Object.entries(cartItems).map(([key, qty]) => (
            <p key={key}>{key}: {qty}</p>
          ))}
        </div>
      );
    };

    const { getByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(getByText('1-S: 1')).toBeInTheDocument();
    });
  });

  test('clears all items from cart when removeAll is true', async () => {
    const mockCartItems = { '1-S': 2, '1-M': 1 };
    global.fetch = mockFetch(mockCartItems);

    const TestComponent = () => {
      const { removeFromCart, cartItems, setCartItems } = React.useContext(ShopContext);
      React.useEffect(() => {
        setCartItems(mockCartItems);
        removeFromCart(1, 'S', true);
      }, [removeFromCart, setCartItems]);
      return (
        <div>
          {Object.entries(cartItems).map(([key, qty]) => (
            <p key={key}>{key}: {qty}</p>
          ))}
        </div>
      );
    };

    const { queryByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(queryByText('1-S: 2')).not.toBeInTheDocument();
    });
  });

  test('gets total cart items', async () => {
    const mockCartItems = { '1-S': 2, '1-M': 1 };
    global.fetch = mockFetch(mockCartItems);

    const TestComponent = () => {
      const { getTotalCartItems, setCartItems } = React.useContext(ShopContext);
      React.useEffect(() => {
        setCartItems(mockCartItems);
      }, [setCartItems]);
      return (
        <div>
          <p>Total: {getTotalCartItems()}</p>
        </div>
      );
    };

    const { getByText } = render(
      <ShopProvider>
        <TestComponent />
      </ShopProvider>
    );

    await waitFor(() => {
      expect(getByText('Total: 3')).toBeInTheDocument();
    });
  });
});
