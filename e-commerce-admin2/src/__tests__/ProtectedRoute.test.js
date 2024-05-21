import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../Components/ProtectedRoute'; // Passe den Pfad entsprechend deiner Projektstruktur an

const TestComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

beforeEach(() => {
  localStorage.clear();
});

test('redirects to login if not authenticated', () => {
  render(
    <BrowserRouter>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute element={TestComponent} />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
});

test('redirects to login if not admin', () => {
  localStorage.setItem('auth-token', 'fake-token');
  localStorage.setItem('is_admin', 'false');

  render(
    <BrowserRouter>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute element={TestComponent} />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );

  expect(screen.getByText('Login Page')).toBeInTheDocument();
});

test('renders component if authenticated and admin', () => {
  localStorage.setItem('auth-token', 'fake-token');
  localStorage.setItem('is_admin', 'true');

  render(
    <BrowserRouter>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute element={TestComponent} />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );

  expect(screen.getByText('Protected Content')).toBeInTheDocument();
});
