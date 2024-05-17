const request = require('supertest');
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres'
  }
);

// Define Category model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: false
});

// Routes
app.get('/admincategories', async (req, res) => {
  const categories = await Category.findAll();
  res.json(categories);
});

app.post('/adminaddcategory', async (req, res) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.json({ success: true, category });
});

app.put('/adminupdatecategory/:id', async (req, res) => {
  const { name } = req.body;
  const category = await Category.update({ name }, {
    where: { id: req.params.id }
  });
  res.json({ success: true, category });
});

app.delete('/admindeletecategory/:id', async (req, res) => {
  await Category.destroy({
    where: { id: req.params.id }
  });
  res.json({ success: true, message: 'Category deleted' });
});

let server;
beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = app.listen(5064, () => {
    console.log('Test server running on port 5064');
  });
});

afterAll(async () => {
  await sequelize.close();
  if (server) {
    server.close();
  }
});

describe('Category API', () => {
  it('should show all categories', async () => {
    const response = await request(app).get('/admincategories');
    expect(response.status).toBe(200);
  });

  it('should create a new category', async () => {
    const newCategory = {
      name: 'Test Category'
    };
    const response = await request(app)
      .post('/adminaddcategory')
      .send(newCategory);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.category.name).toBe(newCategory.name);
  });

  it('should update an existing category', async () => {
    const updatedCategory = {
      name: 'Updated Category'
    };
    const category = await Category.create({
      name: 'Old Category'
    });
    const response = await request(app)
      .put(`/adminupdatecategory/${category.id}`)
      .send(updatedCategory);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should delete a category', async () => {
    const category = await Category.create({
      name: 'Category to Delete'
    });
    const response = await request(app)
      .delete(`/admindeletecategory/${category.id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
