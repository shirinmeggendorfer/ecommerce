import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import ProductDetails from '../Pages/Productorganization/ProductDetails/ProductDetails';

const mockProduct = {
  id: 1,
  name: 'Test Product',
  category_id: 1,
  collection_id: 1,
  new_price: 100,
  old_price: 150,
  image: 'test_image_url'
};

const mockCategories = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' }
];

const mockCollections = [
  { id: 1, name: 'Collection 1' },
  { id: 2, name: 'Collection 2' }
];

global.fetch = jest.fn().mockImplementation((url) => {
  if (url.includes('categories')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockCategories)
    });
  }
  if (url.includes('collections')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockCollections)
    });
  }
  if (url.includes('products/1')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockProduct)
    });
  }
  return Promise.reject(new Error('Unknown URL'));
});

describe('ProductDetails', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('loads and displays product details', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} />);
    });

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.name)).toBeInTheDocument();
    });
  });

  it('updates product details', async () => {
    await act(async () => {
      render(<ProductDetails productId={1} />);
    });

    const nameInput = screen.getByLabelText(/Name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Product' } });

    const submitButton = screen.getByText(/Update Product/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/products/1', expect.any(Object));
    });
  });
});
