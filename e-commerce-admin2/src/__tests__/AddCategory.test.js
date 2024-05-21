import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddCategory from '../Pages/Categoryorganization/AddCategory/AddCategory';

global.fetch = jest.fn();
global.alert = jest.fn();

describe('AddCategory', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('renders the AddCategory form', async () => {
    await act(async () => {
      render(<AddCategory />);
    });

    expect(screen.getByText('Add Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Category Name')).toBeInTheDocument();
  });

  it('handles form submission successfully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/addCategory')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Category added successfully' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<AddCategory />);
    });

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Category added successfully');
    });
  });

  it('handles form submission failure', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/addCategory')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Failed to add category' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<AddCategory />);
    });

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to add category');
    });
  });
});
