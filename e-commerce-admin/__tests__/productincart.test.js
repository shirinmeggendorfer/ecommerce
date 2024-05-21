const request = require('supertest');
const jestServerUrl = 'http://localhost:5063';

describe('Product in Cart Endpoint', () => {
  it('should add a product to the cart and return status 200', async () => {
    const productData = {
      itemId: 1
    };

    const response = await request(jestServerUrl)
      .post('/addtocart')
      .send(productData)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Item added successfully');
  });
});
