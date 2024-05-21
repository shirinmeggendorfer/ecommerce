
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FakePaymentButton from '../../../e-commerce-frontend/src/Components/FakePaymentButton';

describe('FakePaymentButton component', () => {
  it('handles payment correctly', () => {
    const onSuccess = jest.fn();
    const { getByText } = render(<FakePaymentButton amount={100} onSuccess={onSuccess} />);
    
    const button = getByText('Buy Now');
    fireEvent.click(button);
    
    // Ensure the onSuccess callback is called after the timeout
    setTimeout(() => {
      expect(onSuccess).toHaveBeenCalledWith({ success: true, message: 'Payment processed successfully' });
    }, 1000);
  });
});
