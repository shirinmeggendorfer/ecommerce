// src/__tests__/AddCollection.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddCollection from '../Pages/Collectionorganization/AddCollection/AddCollection'; // Adjust the import path as needed

// Mock fetch
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

describe('AddCollection component', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('renders the AddCollection component with correct elements', () => {
    render(<AddCollection />);

    expect(screen.getByText('Add Collection')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Collection Name')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('handles input change correctly', () => {
    render(<AddCollection />);

    const input = screen.getByPlaceholderText('Collection Name');
    fireEvent.change(input, { target: { value: 'New Collection' } });

    expect(input.value).toBe('New Collection');
  });

  it('handles form submission successfully', async () => {
    const closeForm = jest.fn();
    const onCollectionAdded = jest.fn();

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    render(<AddCollection closeForm={closeForm} onCollectionAdded={onCollectionAdded} />);

    const input = screen.getByPlaceholderText('Collection Name');
    fireEvent.change(input, { target: { value: 'New Collection' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcollection', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Collection' })
      }));
      expect(closeForm).toHaveBeenCalled();
      expect(onCollectionAdded).toHaveBeenCalled();
    });

    expect(window.alert).toHaveBeenCalledWith('Collection added successfully');
  });

  it('handles form submission failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    });

    render(<AddCollection />);

    const input = screen.getByPlaceholderText('Collection Name');
    fireEvent.change(input, { target: { value: 'New Collection' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcollection', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Collection' })
      }));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to add collection');
    });
  });

  it('handles network error during form submission', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to avoid the error being logged to the console during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AddCollection />);

    const input = screen.getByPlaceholderText('Collection Name');
    fireEvent.change(input, { target: { value: 'New Collection' } });

    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminaddcollection', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Collection' })
      }));
    });

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error submitting collection');
      expect(console.error).toHaveBeenCalledWith('Error:', new Error('Network error'));
    });

    // Restore console.error mock
    console.error.mockRestore();
  });
});
