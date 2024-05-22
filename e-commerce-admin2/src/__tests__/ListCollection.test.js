import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ListCollection from '../Pages/Collectionorganization/ListCollection/ListCollection';
import AddCollection from '../Pages/Collectionorganization/AddCollection/AddCollection'; // Ensure this is correctly imported

global.fetch = jest.fn();
global.alert = jest.fn();

describe('ListCollection component', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('fetches and displays collections on mount', async () => {
    const mockCollections = [
      { id: 1, name: 'Collection 1' },
      { id: 2, name: 'Collection 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCollections
    });

    await act(async () => {
      render(<ListCollection />);
    });

    await waitFor(() => {
      mockCollections.forEach(collection => {
        expect(screen.getByText(collection.name)).toBeInTheDocument();
      });
    });
  });

  it('handles fetching collections error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch collections'));

    await act(async () => {
      render(<ListCollection />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch collections')).toBeInTheDocument();
    });
  });

  it('opens and closes AddCollection form', async () => {
    await act(async () => {
      render(<ListCollection />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Collection'));
    });

    await waitFor(() => {
      expect(screen.getByText('Add Collection')).toBeInTheDocument();
    });

    const closeForm = jest.fn();
    render(<AddCollection closeForm={closeForm} onCollectionAdded={jest.fn()} />);
  });

  it('edits a collection', async () => {
    const mockCollections = [
      { id: 1, name: 'Collection 1' },
      { id: 2, name: 'Collection 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCollections
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCollection />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });

    const input = screen.getByDisplayValue('Collection 1');
    fireEvent.change(input, { target: { value: 'Updated Collection 1' } });

    await act(async () => {
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminupdatecollection/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Collection 1' })
      }));
    });
  });

  it('shows an alert when trying to edit a collection with an empty name', async () => {
    const mockCollections = [
      { id: 1, name: 'Collection 1' },
      { id: 2, name: 'Collection 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCollections
    });

    await act(async () => {
      render(<ListCollection />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Edit')[0]);
    });

    const input = screen.getByDisplayValue('Collection 1');
    fireEvent.change(input, { target: { value: '' } });

    await act(async () => {
      fireEvent.blur(input);
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Collection name cannot be empty.');
    });
  });

  it('deletes a collection', async () => {
    const mockCollections = [
      { id: 1, name: 'Collection 1' },
      { id: 2, name: 'Collection 2' }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCollections
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCollection />);
    });

    await act(async () => {
      fireEvent.click(screen.getAllByText('Delete')[0]);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admindeletecollection/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });

  it('handles adding a new collection error', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    }).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to add collection' })
    });

    await act(async () => {
      render(<ListCollection />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Add New Collection'));
    });

    const input = screen.getByPlaceholderText('Collection Name');
    fireEvent.change(input, { target: { value: 'New Collection' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Submit'));
    });

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to add collection');
    });
  });



 
});
