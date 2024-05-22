import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddProduct from '../Pages/Productorganization/AddProduct/AddProduct';

// Mock the fetch function
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});

test('renders AddProduct form and submits successfully', async () => {
  fetch.mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve([{ id: '1', name: 'Category 1' }]),
    })
  ).mockImplementationOnce(() =>
    Promise.resolve({
      json: () => Promise.resolve([{ id: '1', name: 'Collection 1' }]),
    })
  ).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, image_url: 'http://example.com/image.jpg' }),
    })
  ).mockImplementationOnce(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    })
  );

  const onProductAdded = jest.fn();

  const { getByPlaceholderText, getByText } = render(<AddProduct onProductAdded={onProductAdded} />);

  // Fill out the form
  fireEvent.change(getByPlaceholderText('Product Name'), { target: { value: 'Test Product' } });
  fireEvent.change(getByPlaceholderText('Product New Price'), { target: { value: '100' } });
  fireEvent.change(getByPlaceholderText('Product Old Price'), { target: { value: '150' } });

  // Select category and collection
  fireEvent.change(getByPlaceholderText('Category'), { target: { value: '1' } });
  fireEvent.change(getByPlaceholderText('Collection'), { target: { value: '1' } });

  // Simulate file upload
  const file = new File(['image'], 'image.jpg', { type: 'image/jpeg' });
  fireEvent.change(getByPlaceholderText('Image'), { target: { files: [file] } });

  // Submit the form
  fireEvent.click(getByText('Submit'));

  // Wait for the form submission to complete
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(4));

  // Check if the onProductAdded callback was called
  expect(onProductAdded).toHaveBeenCalled();
});

test('handles image upload failure', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: '1', name: 'Category 1' }]),
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([{ id: '1', name: 'Collection 1' }]),
      })
    ).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
      })
    );
  
    const { getByPlaceholderText, getByText } = render(<AddProduct />);
  
    // Fill out the form
    fireEvent.change(getByPlaceholderText('Product Name'), { target: { value: 'Test Product' } });
    fireEvent.change(getByPlaceholderText('Product New Price'), { target: { value: '100' } });
    fireEvent.change(getByPlaceholderText('Product Old Price'), { target: { value: '150' } });
  
    // Select category and collection
    fireEvent.change(getByPlaceholderText('Category'), { target: { value: '1' } });
    fireEvent.change(getByPlaceholderText('Collection'), { target: { value: '1' } });
  
    // Simulate file upload
    const file = new File(['image'], 'image.jpg', { type: 'image/jpeg' });
    fireEvent.change(getByPlaceholderText('Image'), { target: { files: [file] } });
  
    // Submit the form
    fireEvent.click(getByText('Submit'));
  
    // Wait for the form submission to complete
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3));
  
    // Check if the alert was called with the correct message
    expect(global.alert).toHaveBeenCalledWith('Failed to upload image');
  });
