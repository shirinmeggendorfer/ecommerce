const request = require('supertest'); // Importiert das supertest-Modul, um HTTP-Anfragen zu testen.
const jestServerUrl = 'http://localhost:5061'; // Die Basis-URL des zu testenden Servers.

describe('Login Endpoint', () => {
  // Test-Suite für den Login-Endpunkt

  it('should login a user and return a token', async () => {
    // Test-Fall: sollte einen Benutzer einloggen und ein Token zurückgeben

    const userData = {
      email: 'admin@example.com',
      password: 'password'
    };
    // Simulierte Benutzerdaten für einen erfolgreichen Login-Versuch

    const response = await request(jestServerUrl)
      .post('/login') // Senden einer POST-Anfrage an den /login-Endpunkt
      .send(userData) // Übermitteln der Benutzerdaten im Anfrage-Body
      .expect(200); // Erwartet, dass der Server mit dem Statuscode 200 antwortet

    expect(response.body).toHaveProperty('token');
    // Überprüft, ob die Antwort des Servers ein 'token'-Eigenschaft enthält
  });

  it('should return 400 for invalid credentials', async () => {
    // Test-Fall: sollte 400 für ungültige Anmeldeinformationen zurückgeben

    const userData = {
      email: 'invalid@invalid.com',
      password: 'invalid'
    };
    // Simulierte Benutzerdaten für einen fehlgeschlagenen Login-Versuch

    const response = await request(jestServerUrl)
      .post('/login') // Senden einer POST-Anfrage an den /login-Endpunkt
      .send(userData) // Übermitteln der Benutzerdaten im Anfrage-Body
      .expect(400); // Erwartet, dass der Server mit dem Statuscode 400 antwortet
  });
});
