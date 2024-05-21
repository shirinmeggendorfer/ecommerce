import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Offers from '../Components/Offers/Offers';

describe('Offers component', () => {
  it('renders Offers component with correct elements', () => {
    act(() => {
      render(<Offers />);
    });

    // Check that the headings are rendered correctly
    expect(screen.getByText('Exclusive')).toBeInTheDocument();
    expect(screen.getByText('Offers For You')).toBeInTheDocument();

    // Check that the paragraph is rendered correctly
    expect(screen.getByText('ONLY ON BEST SELLERS PRODUCTS')).toBeInTheDocument();

    // Check that the button is rendered correctly
    expect(screen.getByText('Check now')).toBeInTheDocument();

    // Check that the image is rendered correctly
    const image = screen.getByAltText('');
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('test-file-stub');
  });
});
