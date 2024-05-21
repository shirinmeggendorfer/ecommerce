import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import FakePaymentButton from '../Components/FakePaymentButton';

describe('FakePaymentButton component', () => {
  it('renders the FakePaymentButton component correctly', () => {
    render(<FakePaymentButton amount={100} onSuccess={() => {}} />);

    // Check that the button is rendered correctly
    expect(screen.getByText('Buy Now')).toBeInTheDocument();
  });

  it('initiates payment and calls onSuccess after delay', async () => {
    const mockOnSuccess = jest.fn();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<FakePaymentButton amount={100} onSuccess={mockOnSuccess} />);

    // Use fake timers
    jest.useFakeTimers();

    // Click the button to initiate payment
    fireEvent.click(screen.getByText('Buy Now'));

    // Fast-forward time to ensure the timeout has been executed
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check that the payment initiation is logged
    expect(consoleLogSpy).toHaveBeenCalledWith('Payment initiated');

    // Check that the payment success is logged and the onSuccess function is called
    expect(consoleLogSpy).toHaveBeenCalledWith('Payment successful');
    expect(mockOnSuccess).toHaveBeenCalledWith({
      success: true,
      message: 'Payment processed successfully',
    });

    // Restore the console log spy
    consoleLogSpy.mockRestore();
    // Restore timers to real implementation
    jest.useRealTimers();
  });
});
