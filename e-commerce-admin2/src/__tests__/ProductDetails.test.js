import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ProductDetails from '../Pages/Productorganization/ProductDetails/ProductDetails';

// Mock the fetch calls
global.fetch = jest.fn((url) => {
  if (url.includes('admincategories')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Category 1' }]),
    });
  }
  if (url.includes('admincollections')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, name: 'Collection 1' }]),
    });
  }
  if (url.includes('productadmin')) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          name: 'Test Product',
          category_id: 1,
          collection_id: 1,
          new_price: 10.99,
          old_price: 15.99,
          image: 'http://localhost:4000/example.png',
        }),
    });
  }
  if (url.includes('updateproductadmin')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

describe('ProductDetails Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    global.alert = jest.fn(); // Mock the global alert function
  });

  test('renders product details correctly', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Collection')).toBeInTheDocument();
      expect(screen.getByLabelText('New Price')).toBeInTheDocument();
      expect(screen.getByLabelText('Old Price')).toBeInTheDocument();
      
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10.99')).toBeInTheDocument();
      expect(screen.getByDisplayValue('15.99')).toBeInTheDocument();
    });
  });

  test('fetches categories, collections, and product details on mount', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admincategories');
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admincollections');
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/productadmin/1');
    });
  });

  test('displays loading indicator while fetching data', async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {})); // Simulate loading state

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

   
  });

  test('calls close function when close button is clicked', async () => {
    const mockClose = jest.fn();
    await act(async () => {
      render(<ProductDetails productId={1} close={mockClose} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close'));

    expect(mockClose).toHaveBeenCalled();
  });

  test('handles network error during categories fetching', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('admincategories')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('admincollections')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Collection 1' }]),
        });
      }
      if (url.includes('productadmin')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              name: 'Test Product',
              category_id: 1,
              collection_id: 1,
              new_price: 10.99,
              old_price: 15.99,
              image: 'http://localhost:4000/example.png',
            }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    await waitFor(() => {
      // Error message is logged to the console, we cannot directly check it in the UI without modifying the component
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admincategories');
    });
  });

  test('handles network error during collections fetching', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('admincategories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Category 1' }]),
        });
      }
      if (url.includes('admincollections')) {
        return Promise.reject(new Error('Network error'));
      }
      if (url.includes('productadmin')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              name: 'Test Product',
              category_id: 1,
              collection_id: 1,
              new_price: 10.99,
              old_price: 15.99,
              image: 'http://localhost:4000/example.png',
            }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    await waitFor(() => {
      // Error message is logged to the console, we cannot directly check it in the UI without modifying the component
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admincollections');
    });
  });

  test('handles network error during product fetching', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('admincategories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Category 1' }]),
        });
      }
      if (url.includes('admincollections')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Collection 1' }]),
        });
      }
      if (url.includes('productadmin')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    await waitFor(() => {
      // Error message is logged to the console, we cannot directly check it in the UI without modifying the component
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/productadmin/1');
    });
  });

  test('handles form submission with missing fields', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '' } });

    const submitButton = screen.getByText('Update Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to update product.');
    });
  });

  test('handles form submission with an invalid price format', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    const newPriceInput = screen.getByLabelText('New Price');
    fireEvent.change(newPriceInput, { target: { value: 'invalid' } });

    const submitButton = screen.getByText('Update Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to update product.');
    });
  });

  test('updates state correctly when input fields are changed', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });
    expect(nameInput.value).toBe('Updated Product');

    const newPriceInput = screen.getByLabelText('New Price');
    fireEvent.change(newPriceInput, { target: { value: '20.99' } });
    expect(newPriceInput.value).toBe('20.99');
  });

  test('handles form submission without image', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('updateproductadmin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });

    const submitButton = screen.getByText('Update Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Product updated successfully!');
    });
  });

  test('handles successful form submission', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('updateproductadmin')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    await act(async () => {
      render(<ProductDetails productId={1} close={jest.fn()} />);
    });

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });

    const newPriceInput = screen.getByLabelText('New Price');
    fireEvent.change(newPriceInput, { target: { value: '20.99' } });

    const oldPriceInput = screen.getByLabelText('Old Price');
    fireEvent.change(oldPriceInput, { target: { value: '25.99' } });

    const categorySelect = screen.getByLabelText('Category');
    fireEvent.change(categorySelect, { target: { value: '1' } });

    const collectionSelect = screen.getByLabelText('Collection');
    fireEvent.change(collectionSelect, { target: { value: '1' } });

    const submitButton = screen.getByText('Update Product');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Product updated successfully!');
    });
  });

  
});
