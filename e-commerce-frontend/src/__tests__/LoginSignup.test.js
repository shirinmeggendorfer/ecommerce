import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginSignup from '../Pages/LoginSignup';

// Mock für fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, token: 'mockToken' }),
  })
);

describe('LoginSignup component', () => {
  it('calls login function when on login page and continue button is clicked', async () => {
    const { getByText, getByPlaceholderText } = render(
      <Router>
        <LoginSignup />
      </Router>
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
    await act(async () => {
      // Hier können zusätzliche asynchrone Aktualisierungen durchgeführt werden
    });

    // Überprüfe das erwartete Verhalten, z.B. ob die Login-Funktion aufgerufen wurde
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: '', email: 'test@test.com', password: 'test1234' }),
      });
      

    // Überprüfe weiteres erwartetes Verhalten basierend auf der API-Antwort
    // Beispiel: Überprüfe, ob der Benutzer nach erfolgreicher Anmeldung weitergeleitet wird
  });
});
