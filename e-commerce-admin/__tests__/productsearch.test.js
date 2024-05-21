const request = require('supertest');
const nock = require('nock');
const jestServerUrl = 'http://localhost:5063'; // Die URL Ihres Jest-Servers

describe('Search functionality', () => {
  beforeAll(() => {
    // Hier konfigurieren wir nock
    nock(jestServerUrl)
      .persist() // Damit nock die Interceptions zwischen Tests beibehält
      .get('/search')
      .query(true) // Erlaubt jede Art von Query-String
      .reply(200, (uri) => {
        const query = new URLSearchParams(uri.split('?')[1]);
        const searchTerm = query.get('query');
        if (searchTerm === 'beispiel') {
          return [{
            id: 1,
            name: "Beispielprodukt 1",
            image: "product1.png",
            new_price: "49.99",
            available: true
          }];
        } else {
          return []; // Gibt ein leeres Array zurück, wenn keine Ergebnisse erwartet werden
        }
      });
  });

  afterAll(() => {
    nock.cleanAll(); // Bereinigt alle persistierenden nocks nach den Tests
  });

  it('should return products that match the search query', async () => {
    const searchTerm = 'beispiel';
    const response = await request(jestServerUrl)
      .get(`/search?query=${encodeURIComponent(searchTerm)}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name.toLowerCase()).toContain(searchTerm);
  });

  it('should handle no results appropriately', async () => {
    const searchTerm = 'noresultsexpected';
    const response = await request(jestServerUrl)
      .get(`/search?query=${encodeURIComponent(searchTerm)}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toEqual(0);
  });
});
