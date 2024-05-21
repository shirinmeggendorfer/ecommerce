import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Pages/Login';  // Passe den Pfad entsprechend deiner Projektstruktur an

beforeEach(() => {
  fetch.resetMocks();
  // Mock localStorage
  Storage.prototype.setItem = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders login form', () => {
  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
});

test('successful login', async () => {
  fetch.mockResponseOnce(JSON.stringify({ success: true, token: 'fake-token' }));
  fetch.mockResponseOnce(JSON.stringify({ is_admin: true }));

  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'admin@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password' } });
  fireEvent.click(screen.getByRole('button', { name: /Login/i }));

  await waitFor(() => {
    expect(localStorage.setItem).toHaveBeenCalledWith('auth-token', 'fake-token');
    expect(localStorage.setItem).toHaveBeenCalledWith('is_admin', true); // Boolean true
  });
});

test('failed login', async () => {
  fetch.mockResponseOnce(JSON.stringify({ success: false }));

  // Mock window.alert
  jest.spyOn(window, 'alert').mockImplementation(() => {});

  render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );

  fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'admin@example.com' } });
  fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrong-password' } });
  fireEvent.click(screen.getByRole('button', { name: /Login/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Login failed!');
  });
});
