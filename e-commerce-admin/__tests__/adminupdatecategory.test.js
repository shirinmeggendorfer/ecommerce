const request = require('supertest');
const app = require('../../e-commerce-backend/index'); // Pfad zu deiner index.js-Datei
const { sequelize, Category } = require('../../e-commerce-backend/index'); // Pfad zu deinen Modellen

beforeAll(async () => {
  await sequelize.sync();
  await Category.create({ name: 'Old Category' });
});

afterAll(async () => {
  await sequelize.close();
});

describe('PUT /adminupdatecategory/:id', () => {
  it('should update an existing category', async () => {
    const category = await Category.findOne({ where: { name: 'Old Category' } });

    const response = await request(app)
      .put(`/adminupdatecategory/${category.id}`)
      .send({ name: 'Updated Category' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should return an error for invalid data', async () => {
    const response = await request(app)
      .put('/adminupdatecategory/999')
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
