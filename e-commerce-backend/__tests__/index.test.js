const request = require('supertest');
const { app, sequelize, Category, Collection, Product, Coupon, Order, OrderItem , User } = require('../index');
const jwt = require('jsonwebtoken');
const events = require('events');
const http = require('http');
const { beforeAll, afterAll, afterEach, describe, it, expect, jest } = require('@jest/globals');

let server;
let token;
let adminToken;
let product;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create categories and collections for product tests
  await Category.create({ name: 'TestCategory' });
  await Collection.create({ name: 'TestCollection' });

  // Start the server
  server = app.listen(4002, () => {
    console.log('Server Running on port 4002');
  });
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

describe('API Endpoints', () => {
  it('should sign up a new user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('should return 401 for accessing protected route with invalid token', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer invalidtoken');
    expect(res.statusCode).toEqual(401);
    expect(res.body.errors).toEqual("Invalid token");
  });

  it('should return 400 for creating product with missing fields', async () => {
    const res = await request(app)
      .post('/addproduct')
      .send({ name: '', category_id: '', collection_id: '', new_price: '', old_price: '', image: '' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Invalid input. Required fields are missing or incorrect.");
  });

  it('should return 404 for updating non-existing product', async () => {
    const res = await request(app)
      .put(`/updateproductadmin/9999`)
      .send({ name: '', new_price: 'invalid', old_price: 'invalid', available: true })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Product not found");
  });

  it('should return 404 for deleting non-existing product', async () => {
    const res = await request(app)
      .delete('/removeproduct/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual("Product not found");
  });

  it('should return 400 for invalid login credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('errors');
  });

  it('should get all categories', async () => {
    const res = await request(app)
      .get('/admincategories');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get all collections', async () => {
    const res = await request(app)
      .get('/admincollections');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get all coupons', async () => {
    const res = await request(app)
      .get('/admincoupons');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should handle database connection errors gracefully', async () => {
    jest.spyOn(sequelize, 'authenticate').mockRejectedValue(new Error('Database connection error'));
    const res = await request(app).get('/admin/dashboard');
    expect(res.statusCode).toEqual(401);
    expect(res.body).not.toHaveProperty("*");
  });

  it('should log in the user', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should sign up an admin user', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'adminpassword'
      });
    expect(res.statusCode).toEqual(200);
    await request(app)
      .put(`/users/${res.body.user.id}`)
      .send({ is_admin: true });
    adminToken = res.body.token;
  });

  it('should log in the admin user', async () => {
    const res = await request(app)
      .post('/adminlogin')
      .send({
        email: 'admin@example.com',
        password: 'adminpassword'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    adminToken = res.body.token;
  });

  it('should allow admin to access dashboard', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should not allow non-admin to access dashboard', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should add a category', async () => {
    const res = await request(app)
      .post('/adminaddcategory')
      .send({ name: 'NewCategory' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('category');
  });

  it('should update a category', async () => {
    const category = await Category.findOne({ where: { name: 'NewCategory' } });
    const res = await request(app)
      .put(`/adminupdatecategory/${category.id}`)
      .send({ name: 'UpdatedCategory' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a category', async () => {
    const category = await Category.findOne({ where: { name: 'UpdatedCategory' } });
    const res = await request(app)
      .delete(`/admindeletecategory/${category.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

 
  it('should add a collection', async () => {
    const res = await request(app)
      .post('/adminaddcollection')
      .send({ name: 'NewCollection' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('collection');
  });

  it('should update a collection', async () => {
    const collection = await Collection.findOne({ where: { name: 'NewCollection' } });
    const res = await request(app)
      .put(`/adminupdatecollection/${collection.id}`)
      .send({ name: 'UpdatedCollection' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a collection', async () => {
    const collection = await Collection.findOne({ where: { name: 'UpdatedCollection' } });
    const res = await request(app)
      .delete(`/admindeletecollection/${collection.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should return 500 if an error occurs while deleting the collection', async () => {
    jest.spyOn(Collection, 'destroy').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .delete('/admindeletecollection/1')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message', 'Database error');
  });

  it('should add a coupon', async () => {
    const res = await request(app)
      .post('/adminaddcoupon')
      .send({ name: 'TestCoupon', amount: 10, available: true })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('coupon');
  });

  it('should update a coupon', async () => {
    const coupon = await Coupon.findOne({ where: { name: 'TestCoupon' } });
    const res = await request(app)
      .put(`/adminupdatecoupon/${coupon.id}`)
      .send({ name: 'UpdatedCoupon', amount: 20, available: false })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a coupon', async () => {
    const coupon = await Coupon.findOne({ where: { name: 'UpdatedCoupon' } });
    const res = await request(app)
      .delete(`/admindeletecoupon/${coupon.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

 
  it('should add a product', async () => {
    const res = await request(app)
      .post('/addproduct')
      .send({ name: 'TestProduct', category_id: 1, collection_id: 1, new_price: 100, old_price: 150, image: 'test.jpg' })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('product');
    product = res.body.product;
  });

  it('should update a product', async () => {
    const res = await request(app)
      .put(`/updateproductadmin/${product.id}`)
      .send({ name: 'UpdatedProduct', new_price: 90, old_price: 140, available: true })
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a product', async () => {
    const res = await request(app)
      .delete(`/removeproduct/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
  });

  it('should search for products', async () => {
    const res = await request(app)
      .get('/search')
      .query({ query: 'Product' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should add an item to the cart', async () => {
    const res = await request(app)
      .post('/addtocart')
      .send({ itemId: product.id })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('cartData');
  });

  it('should remove an item from the cart', async () => {
    const res = await request(app)
      .post('/removefromcart')
      .send({ itemId: product.id })
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('cartData');
  });

  it('should get the user cart', async () => {
    const res = await request(app)
      .post('/getcart')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Object);
  });

  it('should get new collections', async () => {
    const res = await request(app)
      .get('/newcollections');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get all products', async () => {
    const res = await request(app)
      .get('/allproducts');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get popular products in women category', async () => {
    const res = await request(app)
      .get('/popularinwomen');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  describe('API Endpoints - Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('API Endpoints - Authorization', () => {
    it('should return 401 for accessing protected route without token', async () => {
      const res = await request(app).get('/admin/dashboard');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 for accessing admin route with non-admin token', async () => {
      const res = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toEqual(403);
    });
  });
});

describe('Database Models', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  describe('Category Model', () => {
    it('should create a category', async () => {
      const category = await Category.create({ name: 'TestCategory' });
      expect(category.name).toEqual('TestCategory');
    });

    it('should handle validation errors when creating a category', async () => {
      try {
        await Category.create({ name: null });
      } catch (error) {
        expect(error.name).toEqual('SequelizeValidationError');
      }
    });

    it('should handle validation errors when creating a collection', async () => {
      try {
        await Collection.create({ name: null });
      } catch (error) {
        expect(error.name).toEqual('SequelizeValidationError');
      }
    });

    it('should handle validation errors when creating a product', async () => {
      try {
        await Product.create({ name: null });
      } catch (error) {
        expect(error.name).toEqual('SequelizeValidationError');
      }
    });

    it('should handle validation errors when creating a coupon', async () => {
      try {
        await Coupon.create({ name: null });
      } catch (error) {
        expect(error.name).toEqual('SequelizeValidationError');
      }
    });

    it('should read a category', async () => {
      const category = await Category.findOne({ where: { name: 'TestCategory' } });
      expect(category).not.toBeNull();
    });

    it('should update a category', async () => {
      const category = await Category.findOne({ where: { name: 'TestCategory' } });
      category.name = 'UpdatedCategory';
      await category.save();
      const updatedCategory = await Category.findOne({ where: { name: 'UpdatedCategory' } });
      expect(updatedCategory).not.toBeNull();
    });

    it('should delete a category', async () => {
      const category = await Category.findOne({ where: { name: 'UpdatedCategory' } });
      await category.destroy();
      const deletedCategory = await Category.findOne({ where: { name: 'UpdatedCategory' } });
      expect(deletedCategory).toBeNull();
    });
  });

  describe('Collection Model', () => {
    it('should create a collection', async () => {
      const collection = await Collection.create({ name: 'TestCollection' });
      expect(collection.name).toEqual('TestCollection');
    });

    it('should read a collection', async () => {
      const collection = await Collection.findOne({ where: { name: 'TestCollection' } });
      expect(collection).not.toBeNull();
    });

    it('should update a collection', async () => {
      const collection = await Collection.findOne({ where: { name: 'TestCollection' } });
      collection.name = 'UpdatedCollection';
      await collection.save();
      const updatedCollection = await Collection.findOne({ where: { name: 'UpdatedCollection' } });
      expect(updatedCollection).not.toBeNull();
    });

    it('should delete a collection', async () => {
      const collection = await Collection.findOne({ where: { name: 'UpdatedCollection' } });
      await collection.destroy();
      const deletedCollection = await Collection.findOne({ where: { name: 'UpdatedCollection' } });
      expect(deletedCollection).toBeNull();
    });
  });

  describe('Product Model', () => {
    it('should create a product', async () => {
      const category = await Category.create({ name: 'TestProductCategory' });
      const collection = await Collection.create({ name: 'TestProductCollection' });
      const product = await Product.create({
        name: 'TestProduct',
        category_id: category.id,
        collection_id: collection.id,
        new_price: 100,
        old_price: 150,
        image: 'test.jpg'
      });
      expect(product.name).toEqual('TestProduct');
    });

    it('should read a product', async () => {
      const product = await Product.findOne({ where: { name: 'TestProduct' } });
      expect(product).not.toBeNull();
    });

    it('should update a product', async () => {
      const product = await Product.findOne({ where: { name: 'TestProduct' } });
      product.name = 'UpdatedProduct';
      await product.save();
      const updatedProduct = await Product.findOne({ where: { name: 'UpdatedProduct' } });
      expect(updatedProduct).not.toBeNull();
    });

    it('should delete a product', async () => {
      const product = await Product.findOne({ where: { name: 'UpdatedProduct' } });
      await product.destroy();
      const deletedProduct = await Product.findOne({ where: { name: 'UpdatedProduct' } });
      expect(deletedProduct).toBeNull();
    });
  });

  describe('Coupon Model', () => {
    it('should create a coupon', async () => {
      const coupon = await Coupon.create({ name: 'TestCoupon', amount: 10, available: true });
      expect(coupon.name).toEqual('TestCoupon');
    });

    it('should read a coupon', async () => {
      const coupon = await Coupon.findOne({ where: { name: 'TestCoupon' } });
      expect(coupon).not.toBeNull();
    });

    it('should update a coupon', async () => {
      const coupon = await Coupon.findOne({ where: { name: 'TestCoupon' } });
      coupon.name = 'UpdatedCoupon';
      await coupon.save();
      const updatedCoupon = await Coupon.findOne({ where: { name: 'UpdatedCoupon' } });
      expect(updatedCoupon).not.toBeNull();
    });

    it('should delete a coupon', async () => {
      const coupon = await Coupon.findOne({ where: { name: 'UpdatedCoupon' } });
      await coupon.destroy();
      const deletedCoupon = await Coupon.findOne({ where: { name: 'UpdatedCoupon' } });
      expect(deletedCoupon).toBeNull();
    });
  });


  describe('User Model', () => {
    it('should create a user', async () => {
      const user = await User.create({ name: 'useer', email: 'testuser@example.com', password: 'testtest232' });
      expect(user.name).toEqual('useer');
    });

    it('should read a user', async () => {
      const user = await User.findOne({ where: { email: 'testuser@example.com' } });
      expect(user).not.toBeNull();
    });

    it('should update a user', async () => {
      const user = await User.findOne({ where: { email: 'testuser@example.com' } });
      user.name = 'UpdatedUser';
      await user.save();
      const updatedUser = await User.findOne({ where: { name: 'UpdatedUser' } });
      expect(updatedUser).not.toBeNull();
      expect(updatedUser.name).toEqual('UpdatedUser');
    });

    it('should delete a user', async () => {
      const user = await User.findOne({ where: { name: 'UpdatedUser' } });
      await user.destroy();
      const deletedUser = await User.findOne({ where: { name: 'UpdatedUser' } });
      expect(deletedUser).toBeNull();
    });

    it('should not create a user with an existing email', async () => {
      try {
        await User.create({
          name: 'AnotherUser',
          email: 'testuser@example.com',
          password: 'password123'
        });
      } catch (error) {
        expect(error.name).toEqual('SequelizeUniqueConstraintError');
      }
    });

    describe('API Endpoints - Additional Tests', () => {
      it('should not allow creating a user with an existing email', async () => {
        const res = await request(app)
          .post('/signup')
          .send({
            name: 'testuser2',
            email: 'testuser@example.com',
            password: 'password456'
          });
        expect(res.statusCode).toEqual(500);
        
      });

      it('should return 401 for accessing user data without token', async () => {
        const res = await request(app).get('/me');
        expect(res.statusCode).toEqual(401);
        expect(res.body.errors).toEqual("Please authenticate using a valid token");
      });

      it('should return 400 for invalid product data', async () => {
        const res = await request(app)
          .post('/addproduct')
          .send({ name: '', category_id: 1, collection_id: 1, new_price: 'invalid', old_price: 75, image: 'invalid.jpg' })
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual("Invalid input. Required fields are missing or incorrect.");
      });

      it('should return 404 for non-existing product update', async () => {
        const res = await request(app)
          .put('/updateproductadmin/9999')
          .send({ name: 'NonExistentProduct', new_price: 90, old_price: 140, available: true })
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Product not found");
      });

      it('should return 404 for non-existing product delete', async () => {
        const res = await request(app)
          .delete('/removeproduct/9999')
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("Product not found");
      });

      it('should return 404 for non-existing user update', async () => {
        const res = await request(app)
          .put('/users/9999')
          .send({ is_admin: true })
          .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toEqual(404);
        expect(res.body.message).toEqual("User not found");
      });

      it('should return 401 for invalid token on protected route', async () => {
        const res = await request(app)
          .get('/admin/dashboard')
          .set('Authorization', 'Bearer invalidtoken');
        expect(res.statusCode).toEqual(401);
        expect(res.body.errors).toEqual("Invalid token");
      });

      it('should return 500 if an error occurs while adding a category', async () => {
        jest.spyOn(Category, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/adminaddcategory')
          .send({ name: 'NewCategory' })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Database error');
      });

      it('should return 500 if an error occurs while adding a collection', async () => {
        jest.spyOn(Collection, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/adminaddcollection')
          .send({ name: 'CollectionWithError' })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Database error');
      });

      it('should return 500 if an error occurs while adding a coupon', async () => {
        jest.spyOn(Coupon, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/adminaddcoupon')
          .send({ name: 'CouponWithError', amount: 10, available: true })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Database error');
      });

      it('should return 400 for invalid JSON body in addproduct', async () => {
        const res = await request(app)
          .post('/addproduct')
          .set('Authorization', `Bearer ${adminToken}`)
          .set('Content-Type', 'application/json')
          .send('invalid-json');

        expect(res.status).toBe(400);
      });

      it('should return 500 if an error occurs while adding a collection', async () => {
        jest.spyOn(Collection, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/adminaddcollection')
          .send({ name: 'NewCollection' })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while adding a coupon', async () => {
        jest.spyOn(Coupon, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/adminaddcoupon')
          .send({ name: 'TestCoupon', amount: 10, available: true })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('success', false);
        expect(res.body).toHaveProperty('message', 'Database error');
      });

      it('should return 500 if an error occurs while adding a product', async () => {
        jest.spyOn(Product, 'create').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app)
          .post('/addproduct')
          .send({
            name: 'TestProduct',
            category_id: 1,
            collection_id: 1,
            new_price: 100,
            old_price: 150,
            image: 'test.jpg'
          })
          .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching categories', async () => {
        jest.spyOn(Category, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/admincategories');

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching collections', async () => {
        jest.spyOn(Collection, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/admincollections');

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching coupons', async () => {
        jest.spyOn(Coupon, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/admincoupons');

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching all products', async () => {
        jest.spyOn(Product, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/allproducts');

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching new collections', async () => {
        jest.spyOn(Product, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/newcollections');

        expect(res.status).toBe(500);
      });

      it('should return 500 if an error occurs while fetching popular products in women category', async () => {
        jest.spyOn(Product, 'findAll').mockImplementation(() => {
          throw new Error('Database error');
        });

        const res = await request(app).get('/popularinwomen');

        expect(res.status).toBe(500);
      });
    });
  });

////
describe('Order Model', () => {


  it('should delete an order', async () => {
    const order = await Order.findOne({ where: { status: 'completed' } });
    if (order) {
      await order.destroy();
      const deletedOrder = await Order.findOne({ where: { status: 'completed' } });
      expect(deletedOrder).toBeNull();
    }
  });
});


describe('OrderItems Model', () => {
 
  it('should delete an order item', async () => {
    const orderItem = await OrderItem.findOne({ where: { quantity: 3 } });
    if (orderItem) {
      await orderItem.destroy();
      const deletedOrderItem = await OrderItem.findOne({ where: { quantity: 3 } });
      expect(deletedOrderItem).toBeNull();
    }
  });
});



 
});


describe('API Endpoints - Enhanced Branch Coverage', () => {
  it('should return 500 for adding a product with invalid token', async () => {
    const res = await request(app)
      .post('/addproduct')
      .send({ name: 'TestProduct', category_id: 1, collection_id: 1, new_price: 100, old_price: 150, image: 'test.jpg' })
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for invalid product ID in update', async () => {
    const res = await request(app)
      .put('/updateproductadmin/invalid')
      .send({ name: 'UpdatedProduct', new_price: 90, old_price: 140, available: true })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching products by invalid category', async () => {
    const res = await request(app)
      .get('/allproductsadmin')
      .query({ category: 'invalid' });

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching non-existing product', async () => {
    const res = await request(app)
      .get('/productadmin/9999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching products by invalid category in popularinwomen', async () => {
    jest.spyOn(Product, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/popularinwomen');

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching categories with invalid query', async () => {
    jest.spyOn(Category, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/admincategories');

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching collections with invalid query', async () => {
    jest.spyOn(Collection, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/admincollections');

    expect(res.statusCode).toBe(500);
  });

  it('should return 500 for fetching coupons with invalid query', async () => {
    jest.spyOn(Coupon, 'findAll').mockImplementation(() => {
      throw new Error('Database error');
    });

    const res = await request(app)
      .get('/admincoupons');

    expect(res.statusCode).toBe(500);
  });

  it('should return 400 for invalid JSON body in addproduct', async () => {
    const res = await request(app)
      .post('/addproduct')
      .send('invalid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'Invalid input. Required fields are missing or incorrect.');
  });

  it('should return 500 for invalid JSON body in updateproductadmin', async () => {
    const res = await request(app)
      .put('/updateproductadmin/1')
      .send('invalid')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(500);
  });

  it('should return 401 for invalid token in fetchuser', async () => {
    const res = await request(app)
      .get('/me')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('errors', 'Invalid token');
  });

  it('should return 401 for invalid token in fetchAdmin', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('errors', 'Invalid token');
  });

  it('should return 403 for non-admin token in fetchAdmin', async () => {
    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  it('should return 401 for token verification error in fetchuser', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Token verification error');
    });

    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('errors', 'Invalid token');
  });

  it('should return 401 for token verification error in fetchAdmin', async () => {
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('Token verification error');
    });

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('errors', 'Invalid token');
  });

  it('should return 401 for user not found in fetchuser', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => null);

    const res = await request(app)
      .get('/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
  });

  it('should return 401 for user not found in fetchAdmin', async () => {
    jest.spyOn(User, 'findOne').mockImplementation(() => null);

    const res = await request(app)
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(401);
  });
});

describe('Sequelize Configuration', () => {
  test('should configure Sequelize for test environment', () => {
    process.env.NODE_ENV = 'test';
    const sequelizeConfig = {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false
    };
    expect(sequelize.options.dialect).toBe(sequelizeConfig.dialect);
    expect(sequelize.options.storage).toBe(sequelizeConfig.storage);
    expect(sequelize.options.logging).toBe(sequelizeConfig.logging);
  });
});

describe('Models', () => {
  test('Category model should be defined correctly', () => {
    expect(Category.tableName).toBe('categories');
    expect(Category.rawAttributes.name.allowNull).toBe(false);
    expect(Category.rawAttributes.name.unique).toBe(true);
  });

  test('Collection model should be defined correctly', () => {
    expect(Collection.tableName).toBe('collections');
    expect(Collection.rawAttributes.name.allowNull).toBe(false);
    expect(Collection.rawAttributes.name.unique).toBe(true);
  });

  test('Coupon model should be defined correctly', () => {
    expect(Coupon.tableName).toBe('coupons');
    expect(Coupon.rawAttributes.name.allowNull).toBe(false);
    expect(Coupon.rawAttributes.name.unique).toBe(true);
  });

  test('Product model should be defined correctly', () => {
    expect(Product.tableName).toBe('products');
    expect(Product.rawAttributes.available.defaultValue).toBe(true);
  });

  test('User model should be defined correctly', () => {
    expect(User.tableName).toBe('users');
    expect(User.rawAttributes.email.unique).toBe(true);
    expect(User.rawAttributes.is_admin.defaultValue).toBe(false);
  });
});

describe('Server error handler', () => {
  let mockServer;
  let consoleSpy;
  let processExitSpy;
  let isTestEnvironment;
  let jestPort;
  let expressPort;

  beforeEach(() => {
    mockServer = new events.EventEmitter();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    isTestEnvironment = true;
    jestPort = 3001;
    expressPort = 3000;
    mockServer.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${isTestEnvironment ? jestPort : expressPort} is already in use`);
        process.exit(1);
      } else {
        console.error('Server error:', error);
      }
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  test('should log specific error message and exit when EADDRINUSE error is received', () => {
    mockServer.emit('error', { code: 'EADDRINUSE' });

    expect(consoleSpy).toHaveBeenCalledWith(`Port ${jestPort} is already in use`);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });

  test('should log generic error message when a different error is received', () => {
    const genericError = new Error('Generic error');
    mockServer.emit('error', genericError);

    expect(consoleSpy).toHaveBeenCalledWith('Server error:', genericError);
    expect(processExitSpy).not.toHaveBeenCalled();
  });
});

describe('POST /adminlogin', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should respond with 400 status code for invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    const response = await request(app)
      .post('/adminlogin')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      errors: "Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort"
    });
  });

  test('should respond with 500 status code for internal server error', async () => {
    User.findOne.mockRejectedValue(new Error('Datenbankfehler'));

    const response = await request(app)
      .post('/adminlogin')
      .send({ email: 'admin@example.com', password: 'adminpassword' });

    expect(response.status).toBe(500);
    expect(response.text).toBe('Interner Serverfehler');
  });
});

describe('POST /removefromcart', () => {
  it('should remove an item from the cart', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/removefromcart').send({ itemId: 'item1', removeAll: true }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.cartData.item1).toBeUndefined();
  });
});

describe('PUT /adminupdatecoupon/:id', () => {
  it('should update a coupon', async () => {
    Coupon.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 20, available: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /adminaddcoupon', () => {
  it('should add a new coupon', async () => {
    const coupon = { id: 1, name: 'TestCoupon', amount: 10, available: true };
    Coupon.create = jest.fn().mockResolvedValue(coupon);
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', amount: 10, available: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, coupon });
  });
});

describe('GET /admincollections', () => {
  it('should return all collections', async () => {
    const collections = [{ id: 1, name: 'TestCollection' }];
    Collection.findAll = jest.fn().mockResolvedValue(collections);
    const res = await request(app).get('/admincollections');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(collections);
  });
});

describe('DELETE /admindeletecollection/:id', () => {
  it('should delete a collection', async () => {
    Collection.destroy = jest.fn().mockResolvedValue(1);
    const res = await request(app).delete('/admindeletecollection/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('PUT /adminupdatecollection/:id', () => {
  it('should update a collection', async () => {
    Collection.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecollection/1').send({ name: 'UpdatedCollection' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /adminaddcollection', () => {
  it('should add a new collection', async () => {
    const collection = { id: 1, name: 'TestCollection' };
    Collection.create = jest.fn().mockResolvedValue(collection);
    const res = await request(app).post('/adminaddcollection').send({ name: 'TestCollection' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, collection });
  });
});

describe('GET /admincategories', () => {
  it('should return all categories', async () => {
    const categories = [{ id: 1, name: 'TestCategory' }];
    Category.findAll = jest.fn().mockResolvedValue(categories);
    const res = await request(app).get('/admincategories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(categories);
  });
});

describe('PUT /adminupdatecategory/:id', () => {
  it('should update a category', async () => {
    Category.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecategory/1').send({ name: 'UpdatedCategory' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('DELETE /admindeletecategory/:id', () => {
  it('should delete a category', async () => {
    Category.destroy = jest.fn().mockResolvedValue(1);
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('POST /adminaddcategory', () => {
  it('should add a new category', async () => {
    const category = { id: 1, name: 'TestCategory' };
    Category.create = jest.fn().mockResolvedValue(category);
    const res = await request(app).post('/adminaddcategory').send({ name: 'TestCategory' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, category });
  });
});

describe('GET /search', () => {
  it('should return matching products', async () => {
    const products = [{ id: 1, name: 'TestProduct' }];
    Product.findAll = jest.fn().mockResolvedValue(products);
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });

  it('should return 500 on error', async () => {
    Product.findAll = jest.fn().mockRejectedValue(new Error('Search error'));
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(500);
  });
});

describe('POST /getcart', () => {
  it('should return user cart data', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    const res = await request(app).post('/getcart').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ item1: 1 });
  });
});

describe('POST /removefromcart', () => {
  it('should remove an item from the cart', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/removefromcart').send({ itemId: 'item1', removeAll: true }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.cartData.item1).toBeUndefined();
  });
});

describe('POST /addtocart', () => {
  it('should add an item to the cart', async () => {
    const user = { id: 1, cart_data: {} };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/addtocart').send({ itemId: 1 }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Item added successfully');
  });
});

describe('POST /signup', () => {
  it('should register a new user', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({ id: 1 });
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should return 500 if user already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ id: 1 });
    const res = await request(app).post('/signup').send({ email: 'test@example.com' });
    expect(res.status).toBe(500);
    
  });
});

describe('PUT /users/:id', () => {
  it('should make the user an admin', async () => {
    const user = { id: 1, is_admin: false, save: jest.fn() };
    User.findByPk = jest.fn().mockResolvedValue(user);
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(200);
    expect(user.is_admin).toBe(true);
  });
});

describe('GET /me', () => {
  it('should return user data if authenticated', async () => {
    const user = { id: 1, email: 'test@example.com', is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    const res = await request(app).get('/me').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, email: 'test@example.com', is_admin: false });
  });
});

describe('GET /admin/dashboard', () => {
  it('should return admin dashboard if user is admin', async () => {
    const adminUser = { id: 1, is_admin: true };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(adminUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to the Admin Dashboard');
  });

  it('should return 403 if user is not admin', async () => {
    const normalUser = { id: 1, is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(normalUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(403);
    expect(res.body.errors).toBe('Access denied');
  });
});

describe('POST /login', () => {
  it('should login a user', async () => {
    User.findOne = jest.fn().mockResolvedValue({ id: 1, password: 'password' });
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should return 400 if credentials are incorrect', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort');
  });
});

describe('POST /logout', () => {
  it('should logout the user and clear cart', async () => {
    const user = { id: 1, cart_data: { item1: 2 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/logout').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out and cart cleared');
  });
});

describe('GET /productadmin/:id', () => {
  it('should return 404 if product not found', async () => {
    Product.findByPk = jest.fn().mockResolvedValue(null);
    const res = await request(app).get('/productadmin/1');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  it('should return 500 on server error', async () => {
    Product.findByPk = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).get('/productadmin/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('GET /admin/dashboard', () => {
  it('should return admin dashboard if user is admin', async () => {
    const adminUser = { id: 1, is_admin: true };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(adminUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to the Admin Dashboard');
  });

  it('should return 403 if user is not admin', async () => {
    const normalUser = { id: 1, is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(normalUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(403);
    expect(res.body.errors).toBe('Access denied');
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });
});

describe('GET /me', () => {
  it('should return user data if authenticated', async () => {
    const user = { id: 1, email: 'test@example.com', is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    const res = await request(app).get('/me').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, email: 'test@example.com', is_admin: false });
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });
});

describe('PUT /users/:id', () => {
  it('should make the user an admin', async () => {
    const user = { id: 1, is_admin: false, save: jest.fn() };
    User.findByPk = jest.fn().mockResolvedValue(user);
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(200);
    expect(user.is_admin).toBe(true);
  });

  it('should return 404 if user not found', async () => {
    User.findByPk = jest.fn().mockResolvedValue(null);
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 500 on server error', async () => {
    User.findByPk = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('POST /signup', () => {
  it('should register a new user', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if user already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Ein Benutzer mit dieser E-Mail existiert bereits');
  });

  it('should return 500 on server error', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(500);
    expect(res.text).toBe('Interner Serverfehler');
  });
});

describe('POST /login', () => {
  it('should login a user', async () => {
    User.findOne = jest.fn().mockResolvedValue({ id: 1, password: 'password' });
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should return 400 if credentials are incorrect', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'wrongpassword' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort');
  });

  it('should return 500 on server error', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).post('/login').send({ email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(500);
    expect(res.text).toBe('Interner Serverfehler');
  });
});

describe('POST /logout', () => {
  it('should logout the user and clear cart', async () => {
    const user = { id: 1, cart_data: { item1: 2 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/logout').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Logged out and cart cleared');
  });

  it('should return 500 on server error', async () => {
    const user = { id: 1, cart_data: { item1: 2 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).post('/logout').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal Server Error');
  });
});

describe('POST /addtocart', () => {
  it('should add an item to the cart', async () => {
    const user = { id: 1, cart_data: {} };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/addtocart').send({ itemId: 1 }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Item added successfully');
  });
});

describe('POST /removefromcart', () => {
  it('should remove an item from the cart', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/removefromcart').send({ itemId: 'item1', removeAll: true }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.cartData.item1).toBeUndefined();
  });
});

describe('POST /getcart', () => {
  it('should return user cart data', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    const res = await request(app).post('/getcart').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ item1: 1 });
  });
});

describe('GET /search', () => {
  it('should return matching products', async () => {
    const products = [{ id: 1, name: 'TestProduct' }];
    Product.findAll = jest.fn().mockResolvedValue(products);
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });

  it('should return 500 on error', async () => {
    Product.findAll = jest.fn().mockRejectedValue(new Error('Search error'));
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(500);
  });
});

describe('POST /adminaddcategory', () => {
  it('should add a new category', async () => {
    const category = { id: 1, name: 'TestCategory' };
    Category.create = jest.fn().mockResolvedValue(category);
    const res = await request(app).post('/adminaddcategory').send({ name: 'TestCategory' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, category });
  });

  it('should return 500 on server error', async () => {
    Category.create = jest.fn().mockRejectedValue(new Error('Error adding category'));
    const res = await request(app).post('/adminaddcategory').send({ name: 'TestCategory' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error adding category');
  });
});

describe('PUT /adminupdatecategory/:id', () => {
  it('should update a category', async () => {
    Category.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecategory/1').send({ name: 'UpdatedCategory' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Category.update = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).put('/adminupdatecategory/1').send({ name: 'UpdatedCategory' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
  
});

describe('DELETE /admindeletecategory/:id', () => {
  it('should delete a category', async () => {
    Category.destroy = jest.fn().mockResolvedValue(1);
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Category.destroy = jest.fn().mockRejectedValue(new Error('Error deleting category'));
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('GET /admincategories', () => {
  it('should return all categories', async () => {
    const categories = [{ id: 1, name: 'TestCategory' }];
    Category.findAll = jest.fn().mockResolvedValue(categories);
    const res = await request(app).get('/admincategories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(categories);
  });

  it('should return 500 on server error', async () => {
    Category.findAll = jest.fn().mockRejectedValue(new Error('Error fetching categories'));
    const res = await request(app).get('/admincategories');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('POST /adminaddcollection', () => {
  it('should add a new collection', async () => {
    const collection = { id: 1, name: 'TestCollection' };
    Collection.create = jest.fn().mockResolvedValue(collection);
    const res = await request(app).post('/adminaddcollection').send({ name: 'TestCollection' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, collection });
  });

  it('should return 500 on server error', async () => {
    Collection.create = jest.fn().mockRejectedValue(new Error('Error adding collection'));
    const res = await request(app).post('/adminaddcollection').send({ name: 'TestCollection' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error adding collection');
  });
});

describe('PUT /adminupdatecollection/:id', () => {
  it('should update a collection', async () => {
    Collection.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecollection/1').send({ name: 'UpdatedCollection' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Collection.update = jest.fn().mockRejectedValue(new Error('Error updating collection'));
    const res = await request(app).put('/adminupdatecollection/1').send({ name: 'UpdatedCollection' });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error updating collection');
  });
});

describe('DELETE /admindeletecollection/:id', () => {
  it('should delete a collection', async () => {
    Collection.destroy = jest.fn().mockResolvedValue(1);
    const res = await request(app).delete('/admindeletecollection/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Collection.destroy = jest.fn().mockRejectedValue(new Error('Error deleting collection'));
    const res = await request(app).delete('/admindeletecollection/1');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error deleting collection');
  });
});

describe('GET /admincollections', () => {
  it('should return all collections', async () => {
    const collections = [{ id: 1, name: 'TestCollection' }];
    Collection.findAll = jest.fn().mockResolvedValue(collections);
    const res = await request(app).get('/admincollections');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(collections);
  });

  it('should return 500 on server error', async () => {
    Collection.findAll = jest.fn().mockRejectedValue(new Error('Error fetching collections'));
    const res = await request(app).get('/admincollections');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Interner Serverfehler');
  });
});

describe('POST /adminaddcoupon', () => {
  it('should add a new coupon', async () => {
    const coupon = { id: 1, name: 'TestCoupon', amount: 10, available: true };
    Coupon.create = jest.fn().mockResolvedValue(coupon);
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', amount: 10, available: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, coupon });
  });

  it('should return 500 on server error', async () => {
    Coupon.create = jest.fn().mockRejectedValue(new Error('Error adding coupon'));
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', amount: 10, available: true });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error adding coupon');
  });
});

describe('PUT /adminupdatecoupon/:id', () => {
  it('should update a coupon', async () => {
    Coupon.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 20, available: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Coupon.update = jest.fn().mockRejectedValue(new Error('Error updating coupon'));
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 20, available: false });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('GET /admin/dashboard', () => {
  it('should return admin dashboard if user is admin', async () => {
    const adminUser = { id: 1, is_admin: true };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(adminUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Welcome to the Admin Dashboard');
  });

  it('should return 403 if user is not admin', async () => {
    const normalUser = { id: 1, is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(normalUser);
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(403);
    expect(res.body.errors).toBe('Access denied');
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Invalid token');
  });
});

describe('GET /productadmin/:id', () => {
  it('should return 404 if product not found', async () => {
    Product.findByPk = jest.fn().mockResolvedValue(null);
    const res = await request(app).get('/productadmin/1');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Product not found');
  });

  it('should return 500 on server error', async () => {
    Product.findByPk = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).get('/productadmin/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('GET /me', () => {
  it('should return user data if authenticated', async () => {
    const user = { id: 1, email: 'test@example.com', is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    const res = await request(app).get('/me').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, email: 'test@example.com', is_admin: false });
  });

  it('should return 401 if no token provided', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });

  it('should return 401 if token is invalid', async () => {
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).get('/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Invalid token');
  });
});

describe('PUT /users/:id', () => {
  it('should make the user an admin', async () => {
    const user = { id: 1, is_admin: false, save: jest.fn() };
    User.findByPk = jest.fn().mockResolvedValue(user);
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(200);
    expect(user.is_admin).toBe(true);
  });

  it('should return 404 if user not found', async () => {
    User.findByPk = jest.fn().mockResolvedValue(null);
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found');
  });

  it('should return 500 on server error', async () => {
    User.findByPk = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).put('/users/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('PUT /adminupdatecategory/:id', () => {
  it('should update a category', async () => {
    Category.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecategory/1').send({ name: 'UpdatedCategory' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Category.update = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).put('/adminupdatecategory/1').send({ name: 'UpdatedCategory' });
    expect(res.status).toBe(500);

  });
});

describe('DELETE /admindeletecategory/:id', () => {
  it('should delete a category', async () => {
    Category.destroy = jest.fn().mockResolvedValue(1);
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Category.destroy = jest.fn().mockRejectedValue(new Error('Error deleting category'));
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('GET /search', () => {
  it('should return matching products', async () => {
    const products = [{ id: 1, name: 'TestProduct' }];
    Product.findAll = jest.fn().mockResolvedValue(products);
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });

  it('should return 500 on error', async () => {
    Product.findAll = jest.fn().mockRejectedValue(new Error('Search error'));
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(500);
  });
});

describe('PUT /adminupdatecoupon/:id', () => {
  it('should update a coupon', async () => {
    Coupon.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 20, available: false });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on server error', async () => {
    Coupon.update = jest.fn().mockRejectedValue(new Error('Error updating coupon'));
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 20, available: false });
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Server error');
  });
});

describe('POST /signup', () => {
  it('should register a new user', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    User.create = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 if user already exists', async () => {
    User.findOne = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' });
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Ein Benutzer mit dieser E-Mail existiert bereits');
  });

  it('should return 500 on server error', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('Server error'));
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(500);
    expect(res.text).toBe('Interner Serverfehler');
  });
});

describe('GET /admincollections', () => {
  it('should return 500 on database error', async () => {
    Collection.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
    const res = await request(app).get('/admincollections');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Interner Serverfehler');
  });
});

describe('GET /admincategories', () => {
  it('should return 500 on database error', async () => {
    Category.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
    const res = await request(app).get('/admincategories');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');
  });
});

describe('DELETE /admindeletecategory/:id', () => {
  it('should return 500 on database error', async () => {
    Category.destroy = jest.fn().mockRejectedValue(new Error('Database error'));
    const res = await request(app).delete('/admindeletecategory/1');
    expect(res.status).toBe(500);
  });
});

describe('GET /search', () => {
  it('should return empty array if no products match', async () => {
    Product.findAll = jest.fn().mockResolvedValue([]);
    const res = await request(app).get('/search').query({ query: 'NonExistentProduct' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    Product.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
    const res = await request(app).get('/search').query({ query: 'TestProduct' });
    expect(res.status).toBe(500);
  });
});

describe('POST /removefromcart', () => {
  it('should decrease item quantity if removeAll is false and quantity > 1', async () => {
    const user = { id: 1, cart_data: { item1: 2 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).post('/removefromcart').send({ itemId: 'item1', removeAll: false }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(200);
    expect(res.body.cartData.item1).toBe(1);
  });
});

describe('POST /login', () => {
  it('should return 500 if email is missing', async () => {
    const res = await request(app).post('/login').send({ password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort');
  });
});

describe('POST /signup', () => {
  it('should handle missing username', async () => {
    const res = await request(app).post('/signup').send({ email: 'tesrwrfewt@example.com', password: 'password' });
    expect(res.status).toBe(500);
  });

  it('should handle missing email', async () => {
    const res = await request(app).post('/signup').send({ username: 'test', password: 'password' });
    expect(res.status).toBe(500);
  });

  it('should handle missing password', async () => {
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com' });
    expect(res.status).toBe(500);
  });
});

describe('POST /signup', () => {
  it('should handle validation errors for short username', async () => {
    const res = await request(app).post('/signup').send({ username: 'te', email: 'test@example.com', password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Validation errors');
  });
  

  it('should handle validation errors for invalid email', async () => {
    const res = await request(app).post('/signup').send({ username: 'test', email: 'invalid-email', password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Validation errors');
  });

  it('should handle validation errors for short password', async () => {
    const res = await request(app).post('/signup').send({ username: 'test', email: 'test@example.com', password: 'pwd' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toContain('Validation errors');
  });
});

describe('POST /login', () => {
  it('should return 400 if email is invalid', async () => {
    const res = await request(app).post('/login').send({ email: 'invalid-email', password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBe('Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort');
  });
});



describe('GET /search', () => {
  it('should handle case-insensitive search', async () => {
    const products = [{ id: 1, name: 'TestProduct' }];
    Product.findAll = jest.fn().mockResolvedValue(products);
    const res = await request(app).get('/search').query({ query: 'testproduct' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });

  it('should handle special characters in search query', async () => {
    const products = [{ id: 1, name: 'Test@Product' }];
    Product.findAll = jest.fn().mockResolvedValue(products);
    const res = await request(app).get('/search').query({ query: 'Test@Product' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual(products);
  });
});

describe('PUT /adminupdatecategory/:id', () => {
  it('should return 400 if name is too long', async () => {
    const longName = 'a'.repeat(256);
    const res = await request(app).put('/adminupdatecategory/1').send({ name: longName });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});

describe('DELETE /admindeletecategory/:id', () => {
  it('should handle invalid category ID', async () => {
    const res = await request(app).delete('/admindeletecategory/invalid-id');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid category ID');
  });
});

describe('GET /admincategories', () => {
  it('should return empty array if no categories found', async () => {
    Category.findAll = jest.fn().mockResolvedValue([]);
    const res = await request(app).get('/admincategories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /admincollections', () => {
  it('should return empty array if no collections found', async () => {
    Collection.findAll = jest.fn().mockResolvedValue([]);
    const res = await request(app).get('/admincollections');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /adminaddcoupon', () => {
  it('should handle missing name', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ amount: 10, available: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should handle missing amount', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', available: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should handle missing available flag', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', amount: 10 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});

describe('PUT /adminupdatecoupon/:id', () => {
  it('should return 400 if amount is negative', async () => {
    Coupon.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: -10, available: false });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should return 400 if available flag is missing', async () => {
    Coupon.update = jest.fn().mockResolvedValue([1]);
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: 10 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});


describe('fetchuser Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("Please authenticate using a valid token");
  });

  it('should return 401 if token verification fails', async () => {
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).get('/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("Invalid token");
  });

  it('should return 401 if user is not found', async () => {
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(null);
    const res = await request(app).get('/me').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("User not found");
  });
});


describe('POST /adminaddcoupon', () => {
  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ amount: 10, available: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should return 400 if amount is missing', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', available: true });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });

  it('should return 400 if available flag is missing', async () => {
    const res = await request(app).post('/adminaddcoupon').send({ name: 'TestCoupon', amount: 10 });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});

describe('PUT /adminupdatecoupon/:id', () => {
  it('should return 400 if amount is negative', async () => {
    const res = await request(app).put('/adminupdatecoupon/1').send({ name: 'UpdatedCoupon', amount: -10, available: false });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});



describe('PUT /adminupdatecategory/:id', () => {
  it('should return 400 if name is too long', async () => {
    const longName = 'a'.repeat(256);
    const res = await request(app).put('/adminupdatecategory/1').send({ name: longName });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Validation error');
  });
});

describe('GET /newcollections', () => {
  it('should return 500 on error', async () => {
    const productFindAllMock = jest.spyOn(Product, 'findAll').mockImplementation(() => Promise.reject(new Error('Database error')));
    const res = await request(app).get('/newcollections');
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
    productFindAllMock.mockRestore();
  });
});

describe('POST /upload', () => {
  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/upload').attach('product', '');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('No file uploaded');
  });
});

describe('POST /api/orders/create', () => {
  it('should return 500 if an error occurs during order creation', async () => {
    const orderCreateMock = jest.spyOn(Order, 'create').mockImplementation(() => Promise.reject(new Error('Order creation error')));
    const res = await request(app)
      .post('/api/orders/create')
      .send({ userId: 1, cartItems: { '1-S': 1 }, totalAmount: 100 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    orderCreateMock.mockRestore();
  });
});

describe('fetchuser Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("Please authenticate using a valid token");
  });

  it('should return 401 if token verification fails', async () => {
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).get('/me').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("Invalid token");
  });

  it('should return 401 if user is not found', async () => {
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(null);
    const res = await request(app).get('/me').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe("User not found");
  });
});


describe('POST /api/orders/create', () => {

  it('should return 500 if an error occurs during order item creation', async () => {
    const productFindByPkMock = jest.spyOn(Product, 'findByPk').mockImplementation(() => Promise.reject(new Error('Product retrieval error')));
    const res = await request(app)
      .post('/api/orders/create')
      .send({ userId: 1, cartItems: { '1-S': 1 }, totalAmount: 100 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');
    productFindByPkMock.mockRestore();
  });
});


describe('PUT /updateproductadmin/:id', () => {


  it('should return 500 if an error occurs during product update', async () => {
    const productFindByPkMock = jest.spyOn(Product, 'findByPk').mockImplementation(() => Promise.reject(new Error('Product retrieval error')));
    const res = await request(app)
      .put('/updateproductadmin/1')
      .send({ name: 'UpdatedProduct', new_price: 90, old_price: 140, available: true })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    productFindByPkMock.mockRestore();
  });
});


describe('GET /admin/dashboard', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/admin/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });

  it('should return 401 if token verification fails', async () => {
    jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer invalidtoken');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Invalid token');
  });

  it('should return 403 if user is not an admin', async () => {
    const user = { id: 1, is_admin: false };
    jwt.verify = jest.fn().mockReturnValue({ user });
    User.findOne = jest.fn().mockResolvedValue(user);

    const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(403);
    expect(res.body.errors).toBe('Access denied');
  });

});


describe('POST /addtocart', () => {


  it('should return 500 if an error occurs during cart update', async () => {
    const user = { id: 1, cart_data: {} };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockImplementation(() => Promise.reject(new Error('Cart update error')));

    const res = await request(app).post('/addtocart').send({ itemId: 1 }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Error adding item to cart');
  });
});

describe('POST /removefromcart', () => {


  it('should return 500 if an error occurs during cart update', async () => {
    const user = { id: 1, cart_data: { item1: 1 } };
    jwt.verify = jest.fn().mockReturnValue({ user: { id: 1 } });
    User.findOne = jest.fn().mockResolvedValue(user);
    User.update = jest.fn().mockImplementation(() => Promise.reject(new Error('Cart update error')));

    const res = await request(app).post('/removefromcart').send({ itemId: 'item1' }).set('Authorization', 'Bearer validtoken');
    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Internal Server Error');
  });
});


describe('GET /search', () => {
  it('should return 500 if an error occurs during search', async () => {
    Product.findAll = jest.fn().mockImplementation(() => Promise.reject(new Error('Search error')));
    const res = await request(app).get('/search').query({ query: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');
  });
});

describe('Authorization Middleware', () => {
  it('should return 401 if no token is provided', async () => {
    const res = await request(app).get('/me');
    expect(res.status).toBe(401);
    expect(res.body.errors).toBe('Please authenticate using a valid token');
  });



  it('should return user data if a valid token is provided', async () => {
    const token = jwt.sign({ user: { id: 1 } }, 'secret_ecom');
    const user = await User.create({ id: 1, name: 'testuser', email: 'test@example.com', password: 'password' });

    const res = await request(app).get('/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});


describe('Error Handling in Routes', () => {
  it('should return 500 on database connection error', async () => {
    const originalFunction = User.findByPk;
    User.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

    const res = await request(app).put('/users/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');

    User.findByPk = originalFunction;
  });

  it('should return 500 on general server error', async () => {
    const originalFunction = Product.findByPk;
    Product.findByPk = jest.fn().mockRejectedValue(new Error('General error'));

    const res = await request(app).put('/updateproductadmin/1');
    expect(res.status).toBe(500);
    expect(res.text).toBe('Internal Server Error');

    Product.findByPk = originalFunction;
  });
});


describe('Order Creation Route', () => {
 


  it('should return 500 on error during order creation', async () => {
    const originalFunction = Order.create;
    Order.create = jest.fn().mockRejectedValue(new Error('Order creation error'));

    const res = await request(app)
      .post('/api/orders/create')
      .send({ userId: 1, cartItems: { '1-1': 2 }, totalAmount: 200 });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal server error');

    Order.create = originalFunction;
  });
});






it('should return 500 if error occurs while deleting product', async () => {
const originalFunction = Product.findByPk;
Product.findByPk = jest.fn().mockRejectedValue(new Error('Product deletion error'));

const res = await request(app).delete('/removeproduct/1');
expect(res.status).toBe(500);

Product.findByPk = originalFunction;
});

describe('Collection Routes', () => {


it('should return 500 if error occurs while retrieving collections', async () => {
const originalFunction = Collection.findAll;
Collection.findAll = jest.fn().mockRejectedValue(new Error('Retrieve collections error'));

const res = await request(app).get('/admincollections');
expect(res.status).toBe(500);

Collection.findAll = originalFunction;
});
});



describe('Product Routes', () => {


it('should return 500 if error occurs while retrieving products', async () => {
const originalFunction = Product.findAll;
Product.findAll = jest.fn().mockRejectedValue(new Error('Retrieve products error'));

const res = await request(app).get('/allproducts');
expect(res.status).toBe(500);

Product.findAll = originalFunction;
});
});

/////////////////
it('should return 400 for too short username', async () => {
  const res = await request(app).post('/signup').send({ username: 'ab', email: 'test@example.com', password: 'password123' });
  expect(res.status).toBe(400);
  expect(res.body.errors).toContain('Validation errors: username too short');
});

it('should return 400 for invalid email', async () => {
  const res = await request(app).post('/signup').send({ username: 'testuser', email: 'invalid-email', password: 'password123' });
  expect(res.status).toBe(400);
  expect(res.body.errors).toContain('Validation errors: invalid email');
});

it('should return 400 for too short password', async () => {
  const res = await request(app).post('/signup').send({ username: 'testuser', email: 'test@example.com', password: 'pwd' });
  expect(res.status).toBe(400);
  expect(res.body.errors).toContain('Validation errors: password too short');
});

it('should return 400 for missing name in product', async () => {
  const res = await request(app).post('/addproduct').send({ category_id: 1, collection_id: 1, new_price: 100, old_price: 150 });
  expect(res.status).toBe(400);
  expect(res.body.message).toEqual("Invalid input. Required fields are missing or incorrect.");
});

it('should return 400 for invalid prices in product', async () => {
  const res = await request(app).post('/addproduct').send({ name: 'TestProduct', category_id: 1, collection_id: 1, new_price: 'invalid', old_price: 'invalid' });
  expect(res.status).toBe(400);
  expect(res.body.message).toEqual("Invalid input. Required fields are missing or incorrect.");
});
it('should return 500 if an error occurs while adding a product', async () => {
  jest.spyOn(Product, 'create').mockImplementation(() => {
    throw new Error('Database error');
  });

  const res = await request(app).post('/addproduct').send({
    name: 'TestProduct',
    category_id: 1,
    collection_id: 1,
    new_price: 100,
    old_price: 150,
    image: 'test.jpg'
  }).set('Authorization', `Bearer ${adminToken}`);

  expect(res.status).toBe(500);
});
it('should return 401 if no token is provided', async () => {
  const res = await request(app).get('/admin/dashboard');
  expect(res.status).toBe(401);
  expect(res.body.errors).toBe('Please authenticate using a valid token');
});

it('should return 401 if token verification fails', async () => {
  jwt.verify = jest.fn().mockImplementation(() => { throw new Error('Invalid token'); });
  const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer invalidtoken');
  expect(res.status).toBe(401);
  expect(res.body.errors).toBe('Invalid token');
});

it('should return 403 if user is not an admin', async () => {
  const user = { id: 1, is_admin: false };
  jwt.verify = jest.fn().mockReturnValue({ user });
  User.findOne = jest.fn().mockResolvedValue(user);

  const res = await request(app).get('/admin/dashboard').set('Authorization', 'Bearer validtoken');
  expect(res.status).toBe(403);
  expect(res.body.errors).toBe('Access denied');
});

