import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Loading from '../Components/Loading/Loading';

describe('Loading component', () => {
  it('renders Loading component with correct text and spinner', () => {
    act(() => {
      render(<Loading />);
    });

    // Check that the text is rendered correctly
    expect(screen.getByText('Processing your payment, please wait...')).toBeInTheDocument();

    // Check that the spinner is rendered correctly
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).toBeInTheDocument();
  });
});
