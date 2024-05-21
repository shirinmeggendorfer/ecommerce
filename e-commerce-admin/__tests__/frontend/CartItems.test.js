import React from 'react';
import { render, waitFor } from '@testing-library/react';
import CartItems from '../CartItems';
import { ShopProvider, ShopContext } from '../../Context/ShopContext';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const mockFetch = (data, ok = true) => jest.fn(() =>
  Promise.resolve({
    ok,
    json: () => Promise.resolve(data)
  })
);

const mockCartItems = { '1-S': 2, '1-M': 1 };

const contextValue = {
  products: [
    { id: 1, name: 'Test Product', new_price: '10.00', image: 'test.jpg' }
  ],
  cartItems: mockCartItems,
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  getTotalCartAmount: jest.fn(() => 30.00)
};

test('renders CartItems component', async () => {
  const TestComponent = () => {
    const { cartItems, products, getTotalCartAmount } = React.useContext(ShopContext);
    return (
      <CartItems cartItems={cartItems} products={products} getTotalCartAmount={getTotalCartAmount} />
    );
  };

  const { getByText } = render(
    <ShopProvider value={contextValue}>
      <TestComponent />
    </ShopProvider>
  );

  await waitFor(() => {
    expect(getByText('Test Product')).toBeInTheDocument();
    expect(getByText('Subtotal')).toBeInTheDocument();
    expect(getByText('$30.00')).toBeInTheDocument();
  });
});
