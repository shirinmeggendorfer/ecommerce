import React from 'react';
import { render } from '@testing-library/react';
import Hero from '../Hero';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders Hero component', () => {
  const { getByText } = render(<Hero />);
  expect(getByText('NEW ARRIVALS ONLY')).toBeInTheDocument();
  expect(getByText('collections')).toBeInTheDocument();
  expect(getByText('for everyone')).toBeInTheDocument();
});
