import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../Cart';
import { ShopContext } from '../../Context/ShopContext';

const contextValue = {
  products: [
    { id: 1, name: 'Test Product', new_price: '10.00', image: 'test.jpg' }
  ],
  cartItems: { '1-S': 2 },
  addToCart: jest.fn(),
  removeFromCart: jest.fn()
};

test('renders Cart component', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ShopContext.Provider value={contextValue}>
        <Cart />
      </ShopContext.Provider>
    </MemoryRouter>
  );
  expect(getByText('Your Shopping Cart')).toBeInTheDocument();
  expect(getByText('Test Product')).toBeInTheDocument();
  expect(getByText('Size: S')).toBeInTheDocument();
  expect(getByText('$10.00')).toBeInTheDocument();
  expect(getByText('Total Amount: $20.00')).toBeInTheDocument();
});
