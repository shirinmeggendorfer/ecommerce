// e-commerce-frontend/src/__tests__/ThankYou.test.js

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ThankYou from '../Pages/ThankYou';

describe('ThankYou component', () => {
  it('renders the ThankYou component with correct elements', () => {
    render(
      <Router>
        <ThankYou />
      </Router>
    );

    // Check for the heading
    expect(screen.getByText('Thank you for your purchase!')).toBeInTheDocument();

    // Check for the paragraph
    expect(screen.getByText('Your order has been processed successfully.')).toBeInTheDocument();

    // Check for the link
    const linkElement = screen.getByText('Continue Shopping');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');
  });
});
