const request = require('supertest');
const app = require('../../e-commerce-backend/index'); // Pfad zu deiner index.js-Datei
const { sequelize, Category } = require('../../e-commerce-backend/index'); // Pfad zu deinen Modellen

beforeAll(async () => {
  await sequelize.sync();
});

afterAll(async () => {
  await sequelize.close();
});

describe('POST /adminaddcategory', () => {
  it('should add a new category', async () => {
    const response = await request(app)
      .post('/adminaddcategory')
      .send({ name: 'New Category' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.category).toHaveProperty('name', 'New Category');
  });

  it('should return an error for invalid data', async () => {
    const response = await request(app)
      .post('/adminaddcategory')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
