import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FakePaymentButton from '../Components/FakePaymentButton';

describe('FakePaymentButton component', () => {
  it('renders the FakePaymentButton component correctly', () => {
    render(<FakePaymentButton amount={100} onSuccess={() => {}} />);

    // Check that the button is rendered correctly
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
  });

  it('shows payment options when Buy Now button is clicked', () => {
    render(<FakePaymentButton amount={100} onSuccess={() => {}} />);

    // Click the Buy Now button
    fireEvent.click(screen.getByText('Buy Now'));

    // Check that the payment options are rendered
    expect(screen.getByText('Mastercard')).toBeInTheDocument();
    expect(screen.getByText('Visa')).toBeInTheDocument();
    expect(screen.getByText('Paypal')).toBeInTheDocument();
  });

  it('enables proceed button when a payment option is selected', () => {
    render(<FakePaymentButton amount={100} onSuccess={() => {}} />);

    // Click the Buy Now button
    fireEvent.click(screen.getByText('Buy Now'));

    // Select a payment option
    fireEvent.click(screen.getByLabelText('Mastercard'));

    // Check that the Proceed with Payment button is enabled
    expect(screen.getByText('Proceed with Payment')).toBeInTheDocument();
  });

  it('calls onSuccess with amount when Proceed with Payment is clicked', () => {
    const mockOnSuccess = jest.fn();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(<FakePaymentButton amount={100} onSuccess={mockOnSuccess} />);

    // Click the Buy Now button
    fireEvent.click(screen.getByText('Buy Now'));

    // Select a payment option
    fireEvent.click(screen.getByLabelText('Mastercard'));

    // Click the Proceed with Payment button
    fireEvent.click(screen.getByText('Proceed with Payment'));

    // Check that onSuccess was called with the correct amount
    expect(mockOnSuccess).toHaveBeenCalledWith({ amount: 100 });
    // Check that 'Payment successful' was logged
    expect(consoleLogSpy).toHaveBeenCalledWith('Payment successful');

    // Restore the original console.log implementation
    consoleLogSpy.mockRestore();
  });
});
