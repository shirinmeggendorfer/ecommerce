const request = require('supertest');
const app = require('../../e-commerce-backend/index'); // Pfad zu deiner index.js-Datei

describe('GET /', () => {
  it('should return status 200', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });
});
