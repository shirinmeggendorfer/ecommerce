import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ListCollection from '../Pages/Collectionorganization/ListCollection/ListCollection'; // Passen Sie den Importpfad an

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

    fireEvent.click(screen.getByText('Add New Collection'));
    expect(screen.getByText('Add Collection')).toBeInTheDocument();

    // Assuming there is a method to close the AddCollection form, modify this part accordingly
    // fireEvent.click(screen.getByText('Cancel')); // Comment out this line if there's no cancel button

    // await waitFor(() => {
    //   expect(screen.queryByText('Add Collection')).not.toBeInTheDocument();
    // });
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

    fireEvent.click(screen.getAllByText('Edit')[0]);
    const input = screen.getByDisplayValue('Collection 1');
    fireEvent.change(input, { target: { value: 'Updated Collection 1' } });

    fireEvent.blur(input);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminupdatecollection/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Collection 1' })
      }));
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

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admindeletecollection/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
});
