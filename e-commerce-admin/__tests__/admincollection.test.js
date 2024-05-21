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

// Define Collection model
const Collection = sequelize.define('Collection', {
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
  tableName: 'collections',
  timestamps: false
});

// Routes
app.get('/admincollections', async (req, res) => {
  const collections = await Collection.findAll();
  res.json(collections);
});

app.post('/adminaddcollection', async (req, res) => {
  const { name } = req.body;
  const collection = await Collection.create({ name });
  res.json({ success: true, collection });
});

app.put('/adminupdatecollection/:id', async (req, res) => {
  const { name } = req.body;
  const collection = await Collection.update({ name }, {
    where: { id: req.params.id }
  });
  res.json({ success: true, collection });
});

app.delete('/admindeletecollection/:id', async (req, res) => {
  await Collection.destroy({
    where: { id: req.params.id }
  });
  res.json({ success: true, message: 'Collection deleted' });
});

let server;
beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = app.listen(5063, () => {
    console.log('Test server running on port 5063');
  });
});

afterAll(async () => {
  await sequelize.close();
  if (server) {
    server.close();
  }
});

describe('Collection API', () => {
  it('should show all collections', async () => {
    const response = await request(app).get('/admincollections');
    expect(response.status).toBe(200);
  });

  it('should create a new collection', async () => {
    const newCollection = {
      name: 'Test Collection'
    };
    const response = await request(app)
      .post('/adminaddcollection')
      .send(newCollection);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.collection.name).toBe(newCollection.name);
  });

  it('should update an existing collection', async () => {
    const updatedCollection = {
      name: 'Updated Collection'
    };
    const collection = await Collection.create({
      name: 'Old Collection'
    });
    const response = await request(app)
      .put(`/adminupdatecollection/${collection.id}`)
      .send(updatedCollection);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should delete a collection', async () => {
    const collection = await Collection.create({
      name: 'Collection to Delete'
    });
    const response = await request(app)
      .delete(`/admindeletecollection/${collection.id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
