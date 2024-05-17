const request = require('supertest'); // Importiert das supertest-Modul, um HTTP-Anfragen zu testen.
const jestServerUrl = 'http://localhost:5061'; // Die Basis-URL des zu testenden Servers.

describe('Registration Endpoint', () => {
  // Test-Suite für den Registrierungs-Endpunkt

  it('should register a new user and return status 200 for POST /signup when checkbox is checked', async () => {
    // Test-Fall: sollte einen neuen Benutzer registrieren und den Status 200 zurückgeben, wenn die Checkbox angehakt ist

    const userData = {
      username: 'testuser',
      email: 'test@example2.com',
      password: 'testpassword',
      checkbox: true // Simuliert die angehakte Checkbox durch eine zusätzliche Eigenschaft
    };

    const response = await request(jestServerUrl)
      .post('/signup') // Senden einer POST-Anfrage an den /signup-Endpunkt
      .send(userData) // Übermitteln der Benutzerdaten im Anfrage-Body
      .expect(200); // Erwartet, dass der Server mit dem Statuscode 200 antwortet
  });

  it('should return 400 for POST /signup when checkbox is not checked', async () => {
    // Test-Fall: sollte eine Fehlermeldung zurückgeben, wenn die Checkbox nicht angehakt ist

    const userData = {
      username: 'testuser',
      email: 'test@example2.com',
      password: 'testpassword'
      // Simuliert die nicht angehakte Checkbox durch das Fehlen der Eigenschaft
    };

    const response = await request(jestServerUrl)
      .post('/signup') // Senden einer POST-Anfrage an den /signup-Endpunkt
      .send(userData) // Übermitteln der Benutzerdaten im Anfrage-Body
      .expect(400); // Erwartet, dass der Server mit dem Statuscode 400 antwortet
  });
});
