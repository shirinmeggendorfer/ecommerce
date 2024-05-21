import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';
import '@testing-library/jest-dom/extend-expect';  // Stelle sicher, dass dies importiert ist

test('renders SearchBar component and calls onSearch', () => {
  const mockOnSearch = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <SearchBar onSearch={mockOnSearch} />
  );

  const input = getByPlaceholderText('Search products...');
  fireEvent.change(input, { target: { value: 'test' } });

  const button = getByText('Search');
  fireEvent.click(button);

  expect(mockOnSearch).toHaveBeenCalledWith('test');
});
