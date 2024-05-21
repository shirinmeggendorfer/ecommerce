const request = require('supertest');
const jestServerUrl = 'http://localhost:5063';

// Mock server setup (falls erforderlich)
const { rest } = require('msw');
const { setupServer } = require('msw/node');

const server = setupServer(
  // Mock endpoints for product operations
  rest.post('http://localhost:4000/addproduct', (req, res, ctx) => {
    return res(ctx.json({ success: true, product: { ...req.body, id: 1 } }));
  }),
  rest.put('http://localhost:4000/updateproductadmin/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true, product: { ...req.body, id: req.params.id } }));
  }),
  rest.delete('http://localhost:4000/removeproduct/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  rest.get('http://localhost:4000/allproductsadmin', (req, res, ctx) => {
    return res(ctx.json([
      { id: 1, name: 'Product 1', price: 100, category_id: 1, collection_id: 1 },
      { id: 2, name: 'Product 2', price: 200, category_id: 2, collection_id: 2 }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Admin Product Operations', () => {
  it('should add a product', async () => {
    const productData = {
      name: 'Test Product',
      price: 99.99,
      category_id: 1,
      collection_id: 1,
      image: ''
    };

    const response = await request(jestServerUrl)
      .post('/addproduct')
      .send(productData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.product).toHaveProperty('id');
  });

  it('should update a product', async () => {
    const updatedData = {
      name: 'Updated Product',
      price: 109.99,
      category_id: 1,
      collection_id: 1,
      image: ''
    };

    const response = await request(jestServerUrl)
      .put('/updateproductadmin/1')
      .send(updatedData)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.product).toHaveProperty('name', 'Updated Product');
  });

  it('should delete a product', async () => {
    const response = await request(jestServerUrl)
      .delete('/removeproduct/1')
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });

  it('should fetch all products', async () => {
    const response = await request(jestServerUrl)
      .get('/allproductsadmin')
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });
});
