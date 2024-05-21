import React from 'react';
import { render } from '@testing-library/react';
import Offers from '../Offers';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders Offers component', () => {
  const { getByText } = render(<Offers />);
  expect(getByText('Exclusive')).toBeInTheDocument();
  expect(getByText('Offers For You')).toBeInTheDocument();
  expect(getByText('ONLY ON BEST SELLERS PRODUCTS')).toBeInTheDocument();
});
