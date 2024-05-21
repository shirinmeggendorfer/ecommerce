import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AddCoupon from '../Pages/Couponorganization/AddCoupon/AddCoupon';

const mockFetch = (url, options) => {
  if (url.includes('admincategories')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockCategories)
    });
  }
  if (url.includes('admincollections')) {
    return Promise.resolve({
      json: () => Promise.resolve(mockCollections)
    });
  }
  if (url.includes('upload')) {
    return Promise.resolve({
      json: () => Promise.resolve({ success: true, image_url: 'uploaded_image_url' })
    });
  }
  if (url.includes('addcoupon')) {
    return Promise.resolve({
      json: () => Promise.resolve({ success: true })
    });
  }
  return Promise.reject(new Error('Unknown URL'));
};

const mockCategories = [
  { id: 1, name: 'Category 1' },
  { id: 2, name: 'Category 2' }
];

const mockCollections = [
  { id: 1, name: 'Collection 1' },
  { id: 2, name: 'Collection 2' }
];

global.fetch = jest.fn().mockImplementation(mockFetch);
global.alert = jest.fn();

describe('AddCoupon', () => {
  const closeFormMock = jest.fn();
  const onCouponAddedMock = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('loads and displays categories and collections', async () => {
    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Category 1')).toBeInTheDocument();
      expect(screen.getByText('Collection 1')).toBeInTheDocument();
    });
  });

  it('submits new coupon successfully', async () => {
    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const discountInput = screen.getByPlaceholderText('Discount');
    const categorySelect = screen.getByLabelText('Category');
    const collectionSelect = screen.getByLabelText('Collection');
    const fileInput = screen.getByLabelText(/Image/i);

    fireEvent.change(nameInput, { target: { value: 'New Coupon' } });
    fireEvent.change(discountInput, { target: { value: '20' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(collectionSelect, { target: { value: '1' } });
    fireEvent.change(fileInput, { target: { files: [new File(['dummy content'], 'example.png', { type: 'image/png' })] } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/upload', expect.any(Object));
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/addcoupon', expect.any(Object));
      expect(alert).toHaveBeenCalledWith('Coupon added successfully');
      expect(closeFormMock).toHaveBeenCalled();
      expect(onCouponAddedMock).toHaveBeenCalled();
    });
  });

  it('handles coupon addition failure', async () => {
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      json: () => Promise.resolve({ success: false })
    }));

    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const discountInput = screen.getByPlaceholderText('Discount');
    const categorySelect = screen.getByLabelText('Category');
    const collectionSelect = screen.getByLabelText('Collection');
    const fileInput = screen.getByLabelText(/Image/i);

    fireEvent.change(nameInput, { target: { value: 'New Coupon' } });
    fireEvent.change(discountInput, { target: { value: '20' } });
    fireEvent.change(categorySelect, { target: { value: '1' } });
    fireEvent.change(collectionSelect, { target: { value: '1' } });
    fireEvent.change(fileInput, { target: { files: [new File(['dummy content'], 'example.png', { type: 'image/png' })] } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Failed to add coupon');
    });
  });
});
