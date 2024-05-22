import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AddCoupon from '../Pages/Couponorganization/AddCoupon/AddCoupon';

const mockFetch = (url, options) => {
  if (url === 'http://localhost:4000/adminaddcoupon' && options.method === 'POST') {
    const body = JSON.parse(options.body);
    if (body.name && body.amount && typeof body.available === 'boolean') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    return Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ success: false }),
    });
  }
  return Promise.reject(new Error('Unknown URL'));
};

global.fetch = jest.fn().mockImplementation(mockFetch);
global.alert = jest.fn();

describe('AddCoupon', () => {
  const closeFormMock = jest.fn();
  const onCouponAddedMock = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('submits new coupon successfully', async () => {
    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const amountInput = screen.getByPlaceholderText('Discount Amount (%)');
    const availableCheckbox = screen.getByLabelText(/Available/i);

    fireEvent.change(nameInput, { target: { value: 'New Coupon' } });
    fireEvent.change(amountInput, { target: { value: '20' } });
    fireEvent.click(availableCheckbox);

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/adminaddcoupon',
        expect.any(Object)
      );
      expect(alert).toHaveBeenCalledWith('Coupon added successfully');
      expect(closeFormMock).toHaveBeenCalled();
      expect(onCouponAddedMock).toHaveBeenCalled();
    });
  });

  it('handles failed coupon addition', async () => {
    fetch.mockImplementationOnce((url, options) => {
      if (url === 'http://localhost:4000/adminaddcoupon' && options.method === 'POST') {
        return Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ success: false }),
        });
      }
      return mockFetch(url, options);
    });

    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const amountInput = screen.getByPlaceholderText('Discount Amount (%)');
    const availableCheckbox = screen.getByLabelText(/Available/i);

    fireEvent.change(nameInput, { target: { value: 'New Coupon' } });
    fireEvent.change(amountInput, { target: { value: '20' } });
    fireEvent.click(availableCheckbox);

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Failed to add coupon');
    });
  });

  it('handles network error during coupon addition', async () => {
    fetch.mockImplementationOnce(() => {
      return Promise.reject(new Error('Network error'));
    });

    await act(async () => {
      render(<AddCoupon closeForm={closeFormMock} onCouponAdded={onCouponAddedMock} />);
    });

    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const amountInput = screen.getByPlaceholderText('Discount Amount (%)');
    const availableCheckbox = screen.getByLabelText(/Available/i);

    fireEvent.change(nameInput, { target: { value: 'New Coupon' } });
    fireEvent.change(amountInput, { target: { value: '20' } });
    fireEvent.click(availableCheckbox);

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('Error submitting coupon');
    });
  });
});
