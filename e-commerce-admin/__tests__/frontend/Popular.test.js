import React from 'react';
import { render } from '@testing-library/react';
import Popular from '../Popular';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

const data = [
  { id: 1, name: 'Test Product 1', image: 'test1.jpg', new_price: '10.00', old_price: '20.00' },
  { id: 2, name: 'Test Product 2', image: 'test2.jpg', new_price: '15.00', old_price: '30.00' }
];

test('renders Popular component', () => {
  const { getByText } = render(<Popular data={data} />);
  expect(getByText('Popular in Women')).toBeInTheDocument();
  expect(getByText('Test Product 1')).toBeInTheDocument();
  expect(getByText('Test Product 2')).toBeInTheDocument();
});
