import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddProduct from '../Pages/Productorganization/AddProduct/AddProduct';

global.fetch = jest.fn();
global.alert = jest.fn();

describe('AddProduct', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('submits new product successfully', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/addProduct')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ message: 'Product added successfully' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<AddProduct />);
    });

    const nameInput = screen.getByPlaceholderText('Product Name');
    fireEvent.change(nameInput, { target: { value: 'Product3' } });

    const newPriceInput = screen.getByPlaceholderText('Product New Price');
    fireEvent.change(newPriceInput, { target: { value: '30.00' } });

    const oldPriceInput = screen.getByPlaceholderText('Product Old Price');
    fireEvent.change(oldPriceInput, { target: { value: '40.00' } });

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    const collectionSelect = screen.getByLabelText('Collection');
    fireEvent.change(collectionSelect, { target: { value: '1' } });

    const fileInput = screen.getByLabelText('Image');
    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.jpg', { type: 'image/jpeg' })] } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Product added successfully');
    });
  });

  it('handles product addition failure', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/addProduct')) {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: 'Failed to add product' })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<AddProduct />);
    });

    const nameInput = screen.getByPlaceholderText('Product Name');
    fireEvent.change(nameInput, { target: { value: 'Product3' } });

    const newPriceInput = screen.getByPlaceholderText('Product New Price');
    fireEvent.change(newPriceInput, { target: { value: '30.00' } });

    const oldPriceInput = screen.getByPlaceholderText('Product Old Price');
    fireEvent.change(oldPriceInput, { target: { value: '40.00' } });

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    const collectionSelect = screen.getByLabelText('Collection');
    fireEvent.change(collectionSelect, { target: { value: '1' } });

    const fileInput = screen.getByLabelText('Image');
    fireEvent.change(fileInput, { target: { files: [new File([''], 'test.jpg', { type: 'image/jpeg' })] } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to add product');
    });
  });
});
