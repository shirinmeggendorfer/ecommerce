import React from 'react';
import { render } from '@testing-library/react';
import DescriptionBox from '../DescriptionBox';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders DescriptionBox component', () => {
  const { getByText } = render(<DescriptionBox />);
  expect(getByText('Description')).toBeInTheDocument();
  expect(getByText('An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet.')).toBeInTheDocument();
});
