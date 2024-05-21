const request = require('supertest');
const { app, sequelize, Category, Collection, Product, Coupon, User } = require('../index');

let server;
let token;
let adminToken;
let product;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Erstellen Sie Kategorien und Kollektionen für die Produkttests
  await Category.create({ name: 'TestCategory' });
  await Collection.create({ name: 'TestCollection' });

  // Starten Sie den Server
  server = app.listen(4001, () => {
    console.log('Server Running on port 4001');
  });
});

afterAll(async () => {
  // Stoppen Sie den Server und schließen Sie die Datenbankverbindung
  await server.close();
  await sequelize.close();
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

 // Error handling tests
 describe('API Endpoints - Error Handling', () => {
    it('should return 404 for non-existent endpoint', async () => {
      const res = await request(app).get('/nonexistent');
      expect(res.statusCode).toEqual(404);
    });

    it('should return 400 for invalid input data', async () => {
      const res = await request(app)
        .post('/signup')
        .send({ email: 'invalidemail', password: 'short' });
      expect(res.statusCode).toEqual(400);
    });
  });

  // Authorization tests
  describe('API Endpoints - Authorization', () => {
    it('should return 401 for accessing protected route without token', async () => {
      const res = await request(app).get('/admin/dashboard');
      expect(res.statusCode).toEqual(401);
    });

    it('should return 403 for accessing admin route with non-admin token', async () => {
      const res = await request(app)
        .get('/admin/dashboard')
        .set('Authorization', `Bearer ${token}`); // token of non-admin user
      expect(res.statusCode).toEqual(403);
    });
  });
});

describe('Database Models', () => {
  describe('Category Model', () => {
    it('should create a category', async () => {
      const category = await Category.create({ name: 'TestCategory' });
      expect(category.name).toEqual('TestCategory');
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
      const user = await User.create({
        username: 'TestUser',
        email: 'testuser@example.com',
        password: 'password123'
      });
      expect(user.email).toEqual('testuser@example.com');
    });

    it('should read a user', async () => {
      const user = await User.findOne({ where: { email: 'testuser@example.com' } });
      expect(user).not.toBeNull();
    });

    it('should update a user', async () => {
      const user = await User.findOne({ where: { email: 'testuser@example.com' } });
      user.username = 'UpdatedUser';
      await user.save();
      const updatedUser = await User.findOne({ where: { username: 'UpdatedUser' } });
      expect(updatedUser).not.toBeNull();
    });

    it('should delete a user', async () => {
      const user = await User.findOne({ where: { username: 'UpdatedUser' } });
      await user.destroy();
      const deletedUser = await User.findOne({ where: { username: 'UpdatedUser' } });
      expect(deletedUser).toBeNull();
    });

    it('should not create a user with an existing email', async () => {
      try {
        await User.create({
          username: 'AnotherUser',
          email: 'testuser@example.com',
          password: 'password123'
        });
      } catch (error) {
        expect(error.name).toEqual('SequelizeUniqueConstraintError');
      }
    });
  });
});