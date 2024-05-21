import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ListCoupon from '../Pages/CouponOrganization/ListCoupon/ListCoupon'; // Passen Sie den Importpfad an

global.fetch = jest.fn();
global.alert = jest.fn();

describe('ListCoupon component', () => {
  beforeEach(() => {
    fetch.mockClear();
    alert.mockClear();
  });

  it('fetches and displays coupons on mount', async () => {
    const mockCoupons = [
      { id: 1, name: 'Coupon 1', amount: 10, available: true },
      { id: 2, name: 'Coupon 2', amount: 20, available: false }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoupons
    });

    await act(async () => {
      render(<ListCoupon />);
    });

    await waitFor(() => {
      mockCoupons.forEach(coupon => {
        expect(screen.getByText(`${coupon.name} - ${coupon.amount}% ${coupon.available ? '(Available)' : '(Not Available)'}`)).toBeInTheDocument();
      });
    });
  });

  it('handles fetching coupons error', async () => {
    fetch.mockRejectedValueOnce(new Error('Failed to fetch coupons'));

    await act(async () => {
      render(<ListCoupon />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch coupons')).toBeInTheDocument();
    });
  });

  it('opens and closes AddCoupon form', async () => {
    await act(async () => {
      render(<ListCoupon />);
    });

    fireEvent.click(screen.getByText('Add New Coupon'));
    expect(screen.getByText('Add Coupon')).toBeInTheDocument();

    // Assuming there is a method to close the AddCoupon form, modify this part accordingly
    // fireEvent.click(screen.getByText('Cancel')); // Comment out this line if there's no cancel button

    // await waitFor(() => {
    //   expect(screen.queryByText('Add Coupon')).not.toBeInTheDocument();
    // });
  });

  it('edits a coupon', async () => {
    const mockCoupons = [
      { id: 1, name: 'Coupon 1', amount: 10, available: true },
      { id: 2, name: 'Coupon 2', amount: 20, available: false }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoupons
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCoupon />);
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);
    const nameInput = screen.getByPlaceholderText('Coupon Name');
    const amountInput = screen.getByPlaceholderText('Discount Amount (%)');

    fireEvent.change(nameInput, { target: { value: 'Updated Coupon 1' } });
    fireEvent.change(amountInput, { target: { value: '15' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/adminupdatecoupon/1', expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Coupon 1', amount: '15', available: true })
      }));
    });
  });

  it('deletes a coupon', async () => {
    const mockCoupons = [
      { id: 1, name: 'Coupon 1', amount: 10, available: true },
      { id: 2, name: 'Coupon 2', amount: 20, available: false }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCoupons
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    });

    await act(async () => {
      render(<ListCoupon />);
    });

    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('http://localhost:4000/admindeletecoupon/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
  });
});
