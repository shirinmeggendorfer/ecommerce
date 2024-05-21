import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Hero from '../Components/Hero/Hero';

describe('Hero component', () => {
  it('renders Hero component with correct text and images', () => {
    act(() => {
      render(<Hero />);
    });

    // Check that the main text is rendered correctly
    expect(screen.getByText('NEW ARRIVALS ONLY')).toBeInTheDocument();
    expect(screen.getByText('new')).toBeInTheDocument();
    expect(screen.getByText('collections')).toBeInTheDocument();
    expect(screen.getByText('for everyone')).toBeInTheDocument();
    expect(screen.getByText('Latest Collection')).toBeInTheDocument();

    // Check that the images are rendered correctly
    expect(screen.getByAltText('Hand Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Arrow Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Hero Image')).toBeInTheDocument();
  });
});
