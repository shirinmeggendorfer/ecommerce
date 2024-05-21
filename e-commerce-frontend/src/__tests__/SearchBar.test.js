import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../Components/SearchBar/SearchBar';

describe('SearchBar component', () => {
  it('renders SearchBar component with input and button', () => {
    render(<SearchBar onSearch={() => {}} />);

    // Check that the input is rendered correctly
    expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();

    // Check that the button is rendered correctly
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('calls onSearch with the correct term when the form is submitted', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search products...');
    const button = screen.getByText('Search');

    // Simulate typing in the search term
    fireEvent.change(input, { target: { value: 'Test Product' } });

    // Simulate form submission
    fireEvent.click(button);

    // Check that onSearch was called with the correct term
    expect(mockOnSearch).toHaveBeenCalledWith('Test Product');
  });

  it('updates the input value when typed into', () => {
    render(<SearchBar onSearch={() => {}} />);

    const input = screen.getByPlaceholderText('Search products...');

    // Simulate typing in the input
    fireEvent.change(input, { target: { value: 'New Value' } });

    // Check that the input value is updated
    expect(input.value).toBe('New Value');
  });
});
