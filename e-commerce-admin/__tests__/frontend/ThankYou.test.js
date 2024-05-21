import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ThankYou from '../ThankYou';

test('renders ThankYou component', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ThankYou />
    </MemoryRouter>
  );
  expect(getByText('Thank you for your purchase!')).toBeInTheDocument();
  expect(getByText('Your order has been processed successfully.')).toBeInTheDocument();
  expect(getByText('Continue Shopping')).toBeInTheDocument();
});
