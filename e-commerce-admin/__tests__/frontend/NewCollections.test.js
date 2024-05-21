import React from 'react';
import { render } from '@testing-library/react';
import NewCollections from '../NewCollections';
import '@testing-library/jest-dom/extend-expect';
import { expect } from '@jest/globals';

test('renders NewCollections component', () => {
  const data = [{ id: 1, name: 'Test Collection', image: 'test.jpg', new_price: '10.00', old_price: '20.00' }];
  const { getByText } = render(<NewCollections data={data} />);

  expect(getByText('Test Collection')).toBeInTheDocument();
  expect(getByText('$10.00')).toBeInTheDocument();
  expect(getByText('$20.00')).toBeInTheDocument();
});
