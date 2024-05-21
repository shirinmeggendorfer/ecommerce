import React from 'react';
import { render } from '@testing-library/react';
import RelatedProducts from '../RelatedProducts';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

jest.mock('../Assets/data', () => [
  { id: 1, name: 'Test Product 1', image: 'test1.jpg', new_price: '10.00', old_price: '20.00' },
  { id: 2, name: 'Test Product 2', image: 'test2.jpg', new_price: '15.00', old_price: '30.00' }
]);

test('renders RelatedProducts component', () => {
  const { getByText } = render(<RelatedProducts />);
  expect(getByText('Related Products')).toBeInTheDocument();
  expect(getByText('Test Product 1')).toBeInTheDocument();
  expect(getByText('Test Product 2')).toBeInTheDocument();
});
