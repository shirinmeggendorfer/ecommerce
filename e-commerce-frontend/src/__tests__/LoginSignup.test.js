import React from 'react';
import { render, fireEvent, act, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LoginSignup from '../Pages/LoginSignup';

// Mock für fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, token: 'mockToken' }),
  })
);

describe('LoginSignup component', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    localStorage.clear();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('calls login function when on login page and continue button is clicked', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginSignup />
      </MemoryRouter>
    );

    // Fülle die Formularfelder aus
    const emailInput = getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test1234' } });

    // Klicke auf den Weiter-Button
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    // Warte auf asynchrone Aktualisierungen innerhalb von act
    await act(async () => {});

    // Überprüfe das erwartete Verhalten, z.B. ob die Login-Funktion aufgerufen wurde
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@test.com', password: 'test1234' }),
    });

    // Überprüfe weiteres erwartetes Verhalten basierend auf der API-Antwort
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBe('mockToken');
    });
  });


  it('calls signup function when on signup page and continue button is clicked', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <LoginSignup />
      </MemoryRouter>
    );

    // Fülle die Formularfelder aus
    const nameInput = getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test1234' } });

    // Checkbox finden und anklicken
    const termsCheckbox = getByText('By continuing, I agree to the terms of use & privacy policy.');
    fireEvent.click(termsCheckbox.previousSibling);

    // Klicke auf den Weiter-Button
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    // Warte auf asynchrone Aktualisierungen innerhalb von act
    await act(async () => {});

    // Überprüfe das erwartete Verhalten, z.B. ob die Signup-Funktion aufgerufen wurde
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'Test User', email: 'test@test.com', password: 'test1234' }),
    });

    // Überprüfe weiteres erwartetes Verhalten basierend auf der API-Antwort
    await waitFor(() => {
      expect(localStorage.getItem('auth-token')).toBe('mockToken');
    });
  });

  it('shows error when terms and conditions are not checked during signup', async () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <LoginSignup />
      </MemoryRouter>
    );

    // Fülle die Formularfelder aus
    const nameInput = getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test1234' } });

    // Klicke auf den Weiter-Button
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    // Warte auf asynchrone Aktualisierungen innerhalb von act
    await act(async () => {});

    // Überprüfe, ob der Fehler angezeigt wird
    expect(window.alert).toHaveBeenCalledWith('You must agree to the terms and conditions to sign up.');
  });

  it('navigates to login page when "Login here" is clicked on signup page', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<LoginSignup />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const loginHereLink = getByText('Login here');
    fireEvent.click(loginHereLink);

    // Überprüfe die Navigation zur Login-Seite
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('navigates to signup page when "Click here" is clicked on login page', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/signup" element={<div>Signup Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    const clickHereLink = getByText('Click here');
    fireEvent.click(clickHereLink);

    // Überprüfe die Navigation zur Signup-Seite
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });
/*
  it('shows error message when login fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, errors: 'An error occurred while trying to login.' }),
      })
    );

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter initialEntries={['/login']}>
        <LoginSignup />
      </MemoryRouter>
    );

    // Fülle die Formularfelder aus
    const emailInput = getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test1234' } });

   
    // Klicke auf den Weiter-Button
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    // Warte auf asynchrone Aktualisierungen innerhalb von act
    await act(async () => {});

    // Überprüfe, ob der Fehler angezeigt wird
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('shows error message when signup fails', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ success: false, errors: 'Signup failed' }),
      })
    );

    const { getByText, getByPlaceholderText, getByLabelText } = render(
      <MemoryRouter initialEntries={['/signup']}>
        <LoginSignup />
      </MemoryRouter>
    );

    // Fülle die Formularfelder aus
    const nameInput = getByPlaceholderText('Your name');
    fireEvent.change(nameInput, { target: { value: 'Test User' } });

    const emailInput = getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });

    const passwordInput = getByPlaceholderText('Password');
    fireEvent.change(passwordInput, { target: { value: 'test1234' } });

      // Checkbox finden und anklicken
      const termsCheckbox = getByText('By continuing, I agree to the terms of use & privacy policy.');
      fireEvent.click(termsCheckbox.previousSibling);

    // Klicke auf den Weiter-Button
    const continueButton = getByText('Continue');
    fireEvent.click(continueButton);

    // Warte auf asynchrone Aktualisierungen innerhalb von act
    await act(async () => {});

    // Überprüfe, ob der Fehler angezeigt wird
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Signup failed');
    });
  });
  */
});
