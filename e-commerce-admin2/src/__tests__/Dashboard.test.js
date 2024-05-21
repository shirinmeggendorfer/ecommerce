import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../Pages/Dashboard';

describe('Dashboard', () => {
  it('renders the dashboard with heading and welcome message', () => {
    render(<Dashboard />);

    // Überprüfen, ob die Überschrift vorhanden ist
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    
    // Überprüfen, ob die Willkommensnachricht vorhanden ist
    expect(screen.getByText('Welcome to the Admin Panel!')).toBeInTheDocument();
  });
});
