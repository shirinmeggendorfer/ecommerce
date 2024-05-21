import React from 'react';
import { render, screen } from '@testing-library/react';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';

describe('DescriptionBox component', () => {
  it('renders DescriptionBox component with correct text', () => {
    render(<DescriptionBox />);

    // Check that the navigation text is rendered correctly
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Reviews (122)')).toBeInTheDocument();

    // Check that the description text is rendered correctly
    expect(screen.getByText(/An e-commerce website is an online platform/)).toBeInTheDocument();
    expect(screen.getByText(/E-commerce websites typically display products or services/)).toBeInTheDocument();
  });
});
