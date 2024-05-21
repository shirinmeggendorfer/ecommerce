import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Product from '../Product';
import { ShopContext } from '../../Context/ShopContext';

const product = {
  id: 1,
  name: 'Test Product',
  category: 'Test Category'
};

const contextValue = {
  products: [product]
};

test('renders Product component', () => {
  const { getByText } = render(
    <MemoryRouter initialEntries={[`/product/${product.id}`]}>
      <ShopContext.Provider value={contextValue}>
        <Product />
      </ShopContext.Provider>
    </MemoryRouter>
  );
  expect(getByText('Test Product')).toBeInTheDocument();
  expect(getByText('Description')).toBeInTheDocument();
  expect(getByText('Related Products')).toBeInTheDocument();
});
