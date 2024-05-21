import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import ProductDisplay from '../ProductDisplay';
import { ShopContext } from '../../Context/ShopContext';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const product = {
  id: 1,
  name: 'Test Product',
  image: 'test.jpg'
};

const contextValue = {
  addToCart: jest.fn()
};

test('renders ProductDisplay component', () => {
  const { getByText, getByAltText } = render(
    <ShopContext.Provider value={contextValue}>
      <ProductDisplay product={product} />
    </ShopContext.Provider>
  );

  expect(getByText('Test Product')).toBeInTheDocument();
  expect(getByAltText('products')).toBeInTheDocument();
});

test('add to cart button click', () => {
  const { getByText } = render(
    <ShopContext.Provider value={contextValue}>
      <ProductDisplay product={product} />
    </ShopContext.Provider>
  );

  fireEvent.click(getByText('ADD TO CART'));
  expect(contextValue.addToCart).toHaveBeenCalled();
});
