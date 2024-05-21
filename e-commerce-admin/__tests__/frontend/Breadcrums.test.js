import React from 'react';
import { render } from '@testing-library/react';
import Breadcrums from '../Breadcrums';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const product = {
  id: 1,
  name: 'Test Product',
  category: 'Test Category'
};

test('renders Breadcrums component', () => {
  const { getByText } = render(<Breadcrums product={product} />);
  expect(getByText('HOME')).toBeInTheDocument();
  expect(getByText('SHOP')).toBeInTheDocument();
  expect(getByText('Test Category')).toBeInTheDocument();
  expect(getByText('Test Product')).toBeInTheDocument();
});
