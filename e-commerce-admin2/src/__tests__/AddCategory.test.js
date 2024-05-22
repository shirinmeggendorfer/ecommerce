import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddCategory from '../Pages/Categoryorganization/AddCategory/AddCategory'; // Adjust the import path as needed

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

describe('AddCategory component', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('renders the AddCategory component with correct elements', () => {
    render(<AddCategory />);

    expect(screen.getByText('Add Category')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Category Name')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles input change correctly', () => {
    render(<AddCategory />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    expect(input.value).toBe('New Category');
  });

  it('handles form submission successfully', async () => {
    const closeForm = jest.fn();
    const onCategoryAdded = jest.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<AddCategory closeForm={closeForm} onCategoryAdded={onCategoryAdded} />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcategory', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' })
      }));
      expect(closeForm).toHaveBeenCalled();
      expect(onCategoryAdded).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith('Category added successfully');
  });

  it('handles form submission failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    });

    render(<AddCategory />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcategory', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' })
      }));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to add category');
    });
  });

  it('handles network error during form submission', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to avoid the error being logged to the console during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AddCategory />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcategory', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' })
      }));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error submitting category');
      expect(console.error).toHaveBeenCalledWith('Error:', new Error('Network error'));
    });

    // Restore console.error mock
    console.error.mockRestore();
  });

  it('resets form and calls closeForm and onCategoryAdded callbacks on successful submission', async () => {
    const closeForm = jest.fn();
    const onCategoryAdded = jest.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<AddCategory closeForm={closeForm} onCategoryAdded={onCategoryAdded} />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New Category' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcategory', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Category' })
      }));

      // Check that the success alert is shown
      expect(window.alert).toHaveBeenCalledWith('Category added successfully');

      // Check that closeForm and onCategoryAdded callbacks are called
      expect(closeForm).toHaveBeenCalled();
      expect(onCategoryAdded).toHaveBeenCalled();
    });

    // Check that the form is reset
    expect(input.value).toBe('');
  });



  it('handles empty input submission', async () => {
    render(<AddCategory />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: '' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error submitting category');
    });
  });

  it('handles input with only whitespace', async () => {
    render(<AddCategory />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: '   ' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error submitting category');
    });
  });

  it('handles form submission with special characters', async () => {
    const closeForm = jest.fn();
    const onCategoryAdded = jest.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<AddCategory closeForm={closeForm} onCategoryAdded={onCategoryAdded} />);

    const input = screen.getByPlaceholderText('Category Name');
    fireEvent.change(input, { target: { value: 'New@Category!' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcategory', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New@Category!' })
      }));
      expect(closeForm).toHaveBeenCalled();
      expect(onCategoryAdded).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith('Category added successfully');
  });

});
