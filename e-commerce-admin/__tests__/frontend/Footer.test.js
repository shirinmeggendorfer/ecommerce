import React from 'react';
import { render } from '@testing-library/react';
import Footer from '../Footer';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders Footer component', () => {
  const { getByText } = render(<Footer />);
  expect(getByText('Get Your Need')).toBeInTheDocument();
  expect(getByText('Company')).toBeInTheDocument();
  expect(getByText('Products')).toBeInTheDocument();
});
