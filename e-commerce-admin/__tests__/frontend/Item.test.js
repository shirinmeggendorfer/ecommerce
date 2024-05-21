import React from 'react';
import { render } from '@testing-library/react';
import Item from '../Item';
import '@testing-library/jest-dom/extend-expect';
import { expect } from '@jest/globals';

test('renders Item component', () => {
  const item = { id: 1, name: 'Test Item', image: 'test.jpg', new_price: '10.00', old_price: '20.00' };
  const { getByText } = render(<Item {...item} />);

  expect(getByText('Test Item')).toBeInTheDocument();
  expect(getByText('$10.00')).toBeInTheDocument();
  expect(getByText('$20.00')).toBeInTheDocument();
});
