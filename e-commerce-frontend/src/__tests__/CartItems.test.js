import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react'; // Import act from react
import CartItems from '../Components/CartItems/CartItems';
import { ShopContext } from '../Context/ShopContext';

const mockContextValue = {
  products: [
    { id: 1, name: 'Product 1', new_price: 10.0, image: 'product1.jpg' },
    { id: 2, name: 'Product 2', new_price: 20.0, image: 'product2.jpg' },
  ],
  cartItems: { '1-small': 2, '2-medium': 1 },
  removeFromCart: jest.fn(),
  getTotalCartAmount: jest.fn(() => 40.0),
  addToCart: jest.fn()
};

describe('CartItems component', () => {
  it('renders CartItems component with correct props', () => {
    act(() => {
      render(
        <ShopContext.Provider value={mockContextValue}>
          <Router>
            <CartItems />
          </Router>
        </ShopContext.Provider>
      );
    });

    // Check that the product details are rendered correctly
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    
    const prices = screen.getAllByText('$20.00');
    expect(prices).toHaveLength(3); // Two $20.00 (one for Product 2 price and one for total), one $20.00 (Product 1 total)

    // Check that the quantity and total price are rendered correctly
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();

    // Check that the subtotal and total amounts are rendered correctly
    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    const subtotalPrices = screen.getAllByText('$40.00');
    expect(subtotalPrices).toHaveLength(2); // Two $40.00 (one for subtotal and one for total)
    const totalElements = screen.getAllByText('Total');
    expect(totalElements).toHaveLength(2); // Ensure both "Total" elements are found

    // Check that the remove button is rendered and clickable
    const removeButtons = screen.getAllByAltText('Remove');
    expect(removeButtons).toHaveLength(2);
    fireEvent.click(removeButtons[0]);
    expect(mockContextValue.removeFromCart).toHaveBeenCalled();
  });
});
