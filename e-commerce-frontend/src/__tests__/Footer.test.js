import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Components/Footer/Footer';

describe('Footer component', () => {
  it('renders Footer component with correct text and images', () => {
    render(<Footer />);

    // Check that the logo and text are rendered correctly
    expect(screen.getByAltText('Footer Logo')).toBeInTheDocument();
    expect(screen.getByText('Get Your Need')).toBeInTheDocument();

    // Check that the footer links are rendered correctly
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Offices')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();

    // Check that the social media icons are rendered correctly
    expect(screen.getByAltText('Instagram Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Pintrest Icon')).toBeInTheDocument();
    expect(screen.getByAltText('Whatsapp Icon')).toBeInTheDocument();

    // Check that the copyright text is rendered correctly
    expect(screen.getByText('Copyright @ 2024 - All Right Reserved.')).toBeInTheDocument();
  });
});
