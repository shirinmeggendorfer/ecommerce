import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ListProduct from '../Pages/ListProduct/ListProduct'; // Passe den Pfad entsprechend deiner Projektstruktur an

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith('/products')) {
      return Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: 'Product1', price: 10.00 }]),
      });
    }
    if (url.endsWith('/categories')) {
      return Promise.resolve({
        json: () => Promise.resolve([{ id: 1, name: 'Category1' }]),
      });
    }
    return Promise.reject(new Error('not found'));
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders product list and handles add, delete, and filter operations', async () => {
  render(<ListProduct />);

  // Check if the product list is rendered
  await waitFor(() => {
    expect(screen.getByText('List of Products')).toBeInTheDocument();
  });

  // Check if 'Product1' is rendered within its container
  await waitFor(() => {
    expect(screen.getByText('Product1 - $10.00')).toBeInTheDocument();
  });

  // Simulate adding a new product
  fireEvent.click(screen.getByText('Add New Product'));

  // Fill out and submit the form
  fireEvent.change(screen.getByPlaceholderText('Product Name'), { target: { value: 'NewProduct' } });
  fireEvent.change(screen.getByPlaceholderText('Product New Price'), { target: { value: '20.00' } });
  fireEvent.change(screen.getByPlaceholderText('Product Old Price'), { target: { value: '25.00' } });
  fireEvent.change(screen.getByLabelText('Category'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Collection'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Image'), { target: { files: [new File([], 'image.png')] } });

  fireEvent.click(screen.getByText('Submit'));

  // Wait for the new product to be added to the list
  await waitFor(() => {
    expect(screen.getByText('NewProduct - $20.00')).toBeInTheDocument();
  });

  // Simulate deleting the new product
  fireEvent.click(screen.getAllByText('Delete')[1]);

  // Wait for the new product to be removed from the list
  await waitFor(() => {
    expect(screen.queryByText('NewProduct - $20.00')).not.toBeInTheDocument();
  });

  // Simulate filtering products by category
  fireEvent.change(screen.getByRole('combobox'), { target: { value: '1' } });

  // Wait for the filtered products to be displayed
  await waitFor(() => {
    // Add the correct assertion for filtered products here
    expect(screen.getByText('Product1 - $10.00')).toBeInTheDocument();
  });
});
