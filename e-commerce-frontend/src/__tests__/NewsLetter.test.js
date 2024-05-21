import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NewsLetter from '../Components/NewsLetter/NewsLetter';

describe('NewsLetter component', () => {
  it('renders NewsLetter component with correct elements', () => {
    render(<NewsLetter />);

    // Check that the heading is rendered correctly
    expect(screen.getByText('Get Exclusive Offers On Your Email')).toBeInTheDocument();
    
    // Check that the paragraph is rendered correctly
    expect(screen.getByText('Subscribe to our newsletter and stay updated.')).toBeInTheDocument();
    
    // Check that the input and button are rendered correctly
    expect(screen.getByPlaceholderText('Your email id')).toBeInTheDocument();
    expect(screen.getByText('Subscribe')).toBeInTheDocument();
  });

  it('allows the user to enter an email and click subscribe', () => {
    render(<NewsLetter />);

    const input = screen.getByPlaceholderText('Your email id');
    const button = screen.getByText('Subscribe');

    // Simulate user typing in the email input
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(input.value).toBe('test@example.com');

    // Simulate user clicking the subscribe button
    fireEvent.click(button);

    // Add further checks here if there's additional logic to handle the subscription
  });
});
