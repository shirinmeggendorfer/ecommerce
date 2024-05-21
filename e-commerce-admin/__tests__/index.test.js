const request = require('supertest');
const app = require('../path/to/your/index'); // Pfad zu deiner index.js-Datei

describe('Server and Routes', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(4000, (err) => {
      if (err) return done(err);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should respond with a 200 status code for the root route', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  it('should respond with a 404 status code for an unknown route', async () => {
    const response = await request(app).get('/unknown');
    expect(response.status).toBe(404);
  });
});
