import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ListProduct from '../Pages/Productorganization/ListProduct/ListProduct';
import ProductDetails from '../Pages/Productorganization/ProductDetails/ProductDetails';

jest.mock('../Pages/Productorganization/ProductDetails/ProductDetails', () => ({
  __esModule: true,
  default: jest.fn(({ productId, close }) => (
    <div>
      <h2>Edit Product</h2>
      <button onClick={close}>Close</button>
    </div>
  ))
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.endsWith('/allproductsadmin')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Product1', new_price: 10.00, old_price: 15.00 }]),
      });
    }
    if (url.endsWith('/admincategories')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Category1' }]),
      });
    }
    if (url.endsWith('/admincollections')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Collection1' }]),
      });
    }
    if (url.endsWith('/removeproduct/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    if (url.includes('/addproduct')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Product added successfully' }),
      });
    }
    if (url.endsWith('/productadmin/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 1, name: 'Product1', new_price: 10.00, old_price: 15.00, category_id: 1, collection_id: 1 }),
      });
    }
    return Promise.reject(new Error('not found'));
  });

  global.alert = jest.fn(); // Mock the global alert function
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders product list and handles add, delete, and filter operations', async () => {
  await act(async () => {
    render(<ListProduct />);
  });

  // Check if the product list is rendered
  await waitFor(() => {
    expect(screen.getByText('List of Products')).toBeInTheDocument();
  });

  // Simulate opening the add product form
  await act(async () => {
    fireEvent.click(screen.getByText('Add New Product'));
  });

  // Check if the add product form is rendered
  await waitFor(() => {
    expect(screen.getByText('Add Product')).toBeInTheDocument();
  });

  // Mock the form elements
  const productNameInput = screen.getByPlaceholderText('Product Name');
  const newPriceInput = screen.getByPlaceholderText('Product New Price');
  const oldPriceInput = screen.getByPlaceholderText('Product Old Price');
  const categorySelect = screen.getByPlaceholderText('Category');
  const collectionSelect = screen.getByPlaceholderText('Collection');
  const imageInput = screen.getByPlaceholderText('Image');

  await act(async () => {
    fireEvent.change(productNameInput, { target: { value: 'NewProduct' } });
    fireEvent.change(newPriceInput, { target: { value: '20.00' } });
    fireEvent.change(oldPriceInput, { target: { value: '25.00' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(collectionSelect, { target: { value: '1' } });
    fireEvent.change(imageInput, { target: { files: [new File([], 'image.png')] } });
  });

  // Simulate submitting the add product form
  await act(async () => {
    fireEvent.click(screen.getByText('Submit'));
  });

  // Simulate clicking the details button
  await act(async () => {
    fireEvent.click(screen.getAllByText('Details')[0]);
  });

  await waitFor(() => {
    expect(screen.getByText('Edit Product')).toBeInTheDocument();
  });

  // Simulate closing the product details modal
  await act(async () => {
    fireEvent.click(screen.getByText('Close'));
  });

  await waitFor(() => {
    expect(screen.queryByText('Edit Product')).not.toBeInTheDocument();
  });

  // Simulate clicking the delete button
  await act(async () => {
    fireEvent.click(screen.getAllByText('Delete')[0]);
  });

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith('Product deleted successfully');
  });

  // Simulate failed product deletion
  global.fetch.mockImplementationOnce((url) => {
    if (url.endsWith('/removeproduct/1')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: false }),
      });
    }
    return Promise.reject(new Error('not found'));
  });

  await act(async () => {
    fireEvent.click(screen.getAllByText('Delete')[0]);
  });

  await waitFor(() => {
    expect(global.alert).toHaveBeenCalledWith('Failed to delete product');
  });
});
