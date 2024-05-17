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

// Define Coupon model
const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.NUMERIC,
    allowNull: false
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'coupons',
  timestamps: false
});

app.get('/admincoupons', async (req, res) => {
  const coupons = await Coupon.findAll();
  res.json(coupons);
});

app.post('/adminaddcoupon', async (req, res) => {
  const { name, amount, available } = req.body;
  const coupon = await Coupon.create({ name, amount, available });
  res.json({ success: true, coupon });
});

app.put('/adminupdatecoupon/:id', async (req, res) => {
  const { name, amount, available } = req.body;
  const coupon = await Coupon.update({ name, amount, available }, {
    where: { id: req.params.id }
  });
  res.json({ success: true, coupon });
});

app.delete('/admindeletecoupon/:id', async (req, res) => {
  await Coupon.destroy({
    where: { id: req.params.id }
  });
  res.json({ success: true, message: 'Coupon deleted' });
});

let server;
beforeAll(async () => {
  await sequelize.sync({ force: true });
  server = app.listen(5062, () => {
    console.log('Test server running on port 5062');
  });
});

afterAll(async () => {
  await sequelize.close();
  if (server) {
    server.close();
  }
});

describe('Coupon API', () => {
  it('should show all coupons', async () => {
    const response = await request(app).get('/admincoupons');
    expect(response.status).toBe(200);
  });

  it('should create a new coupon', async () => {
    const newCoupon = {
      name: 'Test Coupon',
      amount: 10,
      available: true
    };
    const response = await request(app)
      .post('/adminaddcoupon')
      .send(newCoupon);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.coupon.name).toBe(newCoupon.name);
  });

  it('should update an existing coupon', async () => {
    const updatedCoupon = {
      name: 'Updated Coupon',
      amount: 20,
      available: false
    };
    const coupon = await Coupon.create({
      name: 'Old Coupon',
      amount: 10,
      available: true
    });
    const response = await request(app)
      .put(`/adminupdatecoupon/${coupon.id}`)
      .send(updatedCoupon);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should delete a coupon', async () => {
    const coupon = await Coupon.create({
      name: 'Coupon to Delete',
      amount: 10,
      available: true
    });
    const response = await request(app)
      .delete(`/admindeletecoupon/${coupon.id}`);
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
