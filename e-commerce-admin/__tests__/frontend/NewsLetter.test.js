import React from 'react';
import { render } from '@testing-library/react';
import NewsLetter from '../NewsLetter';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders NewsLetter component', () => {
  const { getByText, getByPlaceholderText } = render(<NewsLetter />);
  expect(getByText('Get Exclusive Offers On Your Email')).toBeInTheDocument();
  expect(getByText('Subscribe')).toBeInTheDocument();
  expect(getByPlaceholderText('Your email id')).toBeInTheDocument();
});
