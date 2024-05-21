import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ListCategory from '../Pages/Categoryorganization/ListCategory/ListCategory'; // Passen Sie den Importpfad an

global.fetch = jest.fn();
global.alert = jest.fn();

describe('ListCategory component', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('fetches and displays categories on mount', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories
    });

    await act(async () => {
      render(<ListCategory />);
    });

    await waitFor(() => {
      mockCategories.forEach(category => {
        expect(screen.getByText(category.name)).toBeInTheDocument();
      });
    });
  });

  it('handles fetching categories error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch categories'));

    await act(async () => {
      render(<ListCategory />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch categories')).toBeInTheDocument();
    });
  });

  it('edits a category', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCategory />);
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);
    const input = screen.getByDisplayValue('Category 1');
    fireEvent.change(input, { target: { value: 'Updated Category 1' } });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminupdatecategory/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Category 1' })
      }));
    });
  });

  it('deletes a category', async () => {
    const mockCategories = [
      { id: 1, name: 'Category 1' },
      { id: 2, name: 'Category 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategories
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCategory />);
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admindeletecategory/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
});
