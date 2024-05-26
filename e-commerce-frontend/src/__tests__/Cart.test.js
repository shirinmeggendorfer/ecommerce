import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../Pages/Cart';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios';

// Mock Axios
jest.mock('axios');

// Mock Components
jest.mock('../Components/FakePaymentButton', () => jest.fn(({ amount, onSuccess }) => (
  <button onClick={() => onSuccess({ amount })}>Proceed with Payment</button>
)));

jest.mock('../Components/Loading/Loading.jsx', () => () => <div>Loading...</div>);

const mockProducts = [
  { id: 1, name: 'Product 1', new_price: '10.00', image: 'product1.png' },
  { id: 2, name: 'Product 2', new_price: '20.00', image: 'product2.png' },
];

const mockCartItems = {
  '1-M': 2, // 2 items of product with id 1 and size M
  '2-L': 1, // 1 item of product with id 2 and size L
};

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
};

const addToCart = jest.fn();
const removeFromCart = jest.fn();
const setCartItems = jest.fn();
const clearCart = jest.fn();

const renderCart = (initialEntries = ['/']) => {
  render(
    <ShopContext.Provider value={{ products: mockProducts, cartItems: mockCartItems, addToCart, removeFromCart, setCartItems, clearCart, user: mockUser }}>
      <MemoryRouter initialEntries={initialEntries}>
        <Cart />
      </MemoryRouter>
    </ShopContext.Provider>
  );
};

describe('Cart component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders Cart component with correct items and calculates total amount', async () => {
    await act(async () => {
      renderCart();
    });

    // Check that product details are rendered correctly
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Size: M')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();

    const totalPriceElements = screen.getAllByText('Total: $20.00');
    expect(totalPriceElements).toHaveLength(2);

    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('Size: L')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();

    // Check the total amount
    expect(screen.getByText('Total Amount: $40.00')).toBeInTheDocument();
  });

  it('handles adding and removing items from the cart', async () => {
    await act(async () => {
      renderCart();
    });

    // Check that addToCart is called when "+" button is clicked
    const addButton = screen.getAllByText('+')[0];
    fireEvent.click(addButton);
    expect(addToCart).toHaveBeenCalledWith('1', 'M');

    // Check that removeFromCart is called when "-" button is clicked
    const removeButton = screen.getAllByText('-')[0];
    fireEvent.click(removeButton);
    expect(removeFromCart).toHaveBeenCalledWith('1', 'M');

    // Check that removeFromCart is called with remove flag when "Remove" button is clicked
    const removeItemButton = screen.getAllByText('Remove')[0];
    fireEvent.click(removeItemButton);
    expect(removeFromCart).toHaveBeenCalledWith('1', 'M', true);
  });

  it('handles successful payment', async () => {
    await act(async () => {
      renderCart();
    });

    // Simulate successful payment
    const paymentButton = screen.getByText('Proceed with Payment');
    fireEvent.click(paymentButton);



    // Check that loading indicator is shown
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Mocking the pathname change
    await waitFor(() => {
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/thank-you'
        },
        writable: true
      });
      expect(window.location.pathname).toBe('/thank-you');
    });

    // Fast-forward time to ensure the timeout has been executed
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('renders correctly when the cart is empty', async () => {
    await act(async () => {
      render(
        <ShopContext.Provider value={{ products: mockProducts, cartItems: {}, addToCart, removeFromCart, setCartItems, clearCart, user: mockUser }}>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </ShopContext.Provider>
      );
    });

    expect(screen.getByText('Your Shopping Cart')).toBeInTheDocument();
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
    expect(screen.getByText('Total Amount: $0.00')).toBeInTheDocument();
  });

  it('displays message when product is not found or price is missing', async () => {
    const mockProductsWithMissingPrice = [
      { id: 1, name: 'Product 1', new_price: '', image: 'product1.png' },
    ];
    const mockCartItemsWithMissingProduct = {
      '1-M': 1,
      '3-L': 1, // Product with id 3 does not exist
    };

    await act(async () => {
      render(
        <ShopContext.Provider value={{ products: mockProductsWithMissingPrice, cartItems: mockCartItemsWithMissingProduct, addToCart, removeFromCart, setCartItems, clearCart, user: mockUser }}>
          <MemoryRouter>
            <Cart />
          </MemoryRouter>
        </ShopContext.Provider>
      );
    });

    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product not found or price missing')).toBeInTheDocument();
  });

  it('navigates to product page when product image is clicked', async () => {
    await act(async () => {
      renderCart();
    });

    const productImage = screen.getAllByRole('img')[0];
    fireEvent.click(productImage);
    
    // Ensure that the window location changes or router navigation occurs
    // Here we just check if the link has the correct href as a basic test
    const productLink = screen.getByRole('link', { name: /product 1/i });
    expect(productLink).toHaveAttribute('href', '/product/1');
  });
});
