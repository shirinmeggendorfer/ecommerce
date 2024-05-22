import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ListCategory from '../Pages/Categoryorganization/ListCategory/ListCategory'; // Adjust the import path

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

    await act(async () => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });

    const input = screen.getByDisplayValue('Category 1');
    fireEvent.change(input, { target: { value: 'Updated Category 1' } });

    await act(async () => {
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminupdatecategory/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Category 1' })
      }));
    });
  });

  it('shows an alert when trying to edit a category with an empty name', async () => {
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

    await act(async () => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });

    const input = screen.getByDisplayValue('Category 1');
    fireEvent.change(input, { target: { value: '' } });

    await act(async () => {
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Category name cannot be empty.');
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

    await act(async () => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admindeletecategory/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });

  it('opens and closes the add category form', async () => {
    await act(async () => {
      render(<ListCategory />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Category'));
    });

    await waitFor(() => {
      expect(screen.getByText('Add Category')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

  });

  it('handles adding a new category error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    }).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to add category' })
    });

    await act(async () => {
      render(<ListCategory />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Category'));
    });

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to add category');
    });
  });

  it('handles empty category list', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    await act(async () => {
      render(<ListCategory />);
    });

    await waitFor(() => {
      expect(screen.getByText('No categories available')).toBeInTheDocument();
    });
  });

  it('sets error when fetching categories fails', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch categories' })
    });

    await act(async () => {
      render(<ListCategory />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch categories')).toBeInTheDocument();
    });
  });

  it('calls onCategoryAdded after successfully adding a new category', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, name: 'New Category' }]
    });

    await act(async () => {
      render(<ListCategory />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Category'));
    });

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Category added successfully');
    });

    await waitFor(() => {
      expect(screen.getByText('New Category')).toBeInTheDocument();
    });
  });
});
