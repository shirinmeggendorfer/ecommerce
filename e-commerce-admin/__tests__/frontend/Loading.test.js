import React from 'react';
import { render } from '@testing-library/react';
import Loading from '../Loading';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders Loading component', () => {
  const { getByText } = render(<Loading />);
  expect(getByText('Processing your payment, please wait...')).toBeInTheDocument();
});
