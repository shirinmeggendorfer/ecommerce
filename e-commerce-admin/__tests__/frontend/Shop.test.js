import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Shop from '../Shop';

test('renders Shop component', () => {
  render(<Shop />);
  expect(screen.getByText('Popular in Women')).toBeInTheDocument();
  expect(screen.getByText('Exclusive')).toBeInTheDocument();
  expect(screen.getByText('NEW COLLECTIONS')).toBeInTheDocument();
});
