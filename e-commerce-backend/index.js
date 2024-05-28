const expressPort = process.env.PORT || 4000;
const jestPort = process.env.JEST_PORT || 5064;
const express = require("express");
const app = express();
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
require('dotenv').config();

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3005', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const { Sequelize, DataTypes } = require('sequelize');

const isTestEnvironment = process.env.NODE_ENV === 'test';

// POSTGRES DB VERBINDUNG
const sequelize = new Sequelize(
  isTestEnvironment
    ? {
        dialect: 'sqlite',
        storage: ':memory:',
        logging: false
      }
    : {
        dialect: 'postgres',
        host: process.env.POSTGRES_HOST,
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB
      }
);

// MODELS
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'categories',
  timestamps: false  
});

const Collection = sequelize.define('Collection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  }
}, {
  tableName: 'collections',
  timestamps: false  
});

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  amount: {
    type: DataTypes.NUMERIC
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'coupons',
  timestamps: false  
});

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING
  },
  category_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Category,
      key: 'id'
    }
  },
  collection_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Collection,
      key: 'id'
    }
  },
  new_price: {
    type: DataTypes.NUMERIC
  },
  old_price: {
    type: DataTypes.NUMERIC
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products'
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  cart_data: {
    type: DataTypes.JSONB
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'users'
});

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.NUMERIC
  },
  status: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'orders',
  timestamps: false  
});

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.NUMERIC
  }
}, {
  tableName: 'order_items',
  timestamps: false  
});



sequelize.authenticate()
  .then(() => {
    console.log('Erfolgreich mit der Datenbank verbunden!');
  })
  .catch(err => {
    console.error('Fehler bei der Verbindung zur Datenbank:', err);
  });

let server;
if (!isTestEnvironment) {
  server = app.listen(expressPort, () => {
    console.log(`Server Running on port ${expressPort}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${expressPort} is already in use`);
      process.exit(1);
    } else {
      console.error('Server error:', error);
    }
  });
}

module.exports = { app, sequelize, Category, Collection, Product, Coupon, Order, OrderItem, User, server };



// Image Storage Engine 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'upload/images');
    console.log('Uploading file to:', uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log('Uploading file:', file);
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

app.post("/upload", upload.single('product'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: 0, message: 'No file uploaded' });
  }
  console.log('File uploaded to:', req.file.path);
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  });
});

app.use('/images', express.static(path.join(__dirname, 'upload/images')));




  
 
// Middleware to fetch user from database
const fetchuser = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ errors: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = await User.findOne({ where: { id: data.user.id } });
    if (!req.user) {
      return res.status(401).send({ errors: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).send({ errors: 'Invalid token' });
  }
};


// Middleware to check if the user is an admin
const fetchAdmin = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ errors: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = await User.findOne({ where: { id: data.user.id } });
    if (!req.user || !req.user.is_admin) {
      return res.status(403).send({ errors: 'Access denied' });
    }
    next();
  } catch (error) {
    return res.status(401).send({ errors: 'Invalid token' });
  }
};


// ROUTES

//ADMINCHECK
app.get('/admin/dashboard', fetchAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

app.get('/me', fetchuser, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, is_admin: req.user.is_admin });
});

app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.is_admin = true;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});




//ZUSATZ: ORDERS 
app.post('/api/orders/create', async (req, res) => {
  const { userId, cartItems, totalAmount } = req.body;
  try {
    const order = await Order.create({ user_id: userId, total_amount: totalAmount, status: 'Pending' });
    const orderItems = await Promise.all(Object.keys(cartItems).map(async key => {
      const [productId, size] = key.split('-');
      const quantity = cartItems[key];
      const product = await Product.findByPk(productId);
      if (product) {
        return await OrderItem.create({ order_id: order.id, product_id: product.id, quantity, price: product.new_price });
      }
    }));
    res.status(201).json({ order, orderItems });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/getuser', fetchuser, (req, res) => {
  res.status(200).json(req.user);
});

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (username.length < 3 || !email.includes('@') || password.length < 6) {
      return res.status(400).json({ success: false, errors: 'Validation errors' });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, errors: 'Ein Benutzer mit dieser E-Mail existiert bereits' });
    }
    const newUser = await User.create({ name: username, email, password });
    const token = jwt.sign({ user: { id: newUser.id } }, 'secret_ecom');
    res.status(200).json({ success: true, token, user: { id: newUser.id } });
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});


app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && user.password === req.body.password) {
      const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, errors: 'Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort' });
    }
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});

app.post('/adminlogin', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && user.password === req.body.password && user.is_admin) {
      const token = jwt.sign({ user: { id: user.id, is_admin: user.is_admin } }, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.status(403).json({ success: false, errors: 'Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort' });
    }
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});


app.post('/logout', fetchuser, async (req, res) => {
  try {
    await User.update({ cart_data: {} }, { where: { id: req.user.id } });
    res.send({ success: true, message: 'Logged out and cart cleared' });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/addtocart', fetchuser, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.cart_data = user.cart_data || {};
    user.cart_data[req.body.itemId] = (user.cart_data[req.body.itemId] || 0) + 1;
    await User.update({ cart_data: user.cart_data }, { where: { id: req.user.id } });
    res.json({ message: 'Item added successfully', cartData: user.cart_data });
  } catch (error) {
    res.status(500).send({ message: 'Error adding item to cart', error: error.toString() });
  }
});

app.post('/removefromcart', fetchuser, async (req, res) => {
  try {
    const { itemId, removeAll } = req.body;
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user || !user.cart_data) {
      return res.status(404).json({ message: 'User or cart not found.' });
    }
    if (removeAll || user.cart_data[itemId] <= 1) {
      delete user.cart_data[itemId];
    } else {
      user.cart_data[itemId] -= 1;
    }
    await User.update({ cart_data: user.cart_data }, { where: { id: req.user.id } });
    res.json({ success: true, cartData: user.cart_data });
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' });
  }
});

app.post('/getcart', fetchuser, async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).send('User not found');
  }
  res.json(user.cart_data || {});
});

// Product search
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.findAll({
      where: { name: { [Sequelize.Op.like]: `%${query}%` } }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Admin category routes
app.post('/adminaddcategory', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

app.put('/adminupdatecategory/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (name.length > 255) {
      return res.status(400).send({ message: 'Validation error' });
    }
    const category = await Category.update({ name }, { where: { id: req.params.id } });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

app.delete('/admindeletecategory/:id', async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

app.get('/admincategories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Admin collection routes
app.post('/adminaddcollection', async (req, res) => {
  try {
    const { name } = req.body;
    const collection = await Collection.create({ name });
    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

app.put('/adminupdatecollection/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const collection = await Collection.update({ name }, { where: { id: req.params.id } });
    res.json({ success: true, collection });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

app.delete('/admindeletecollection/:id', async (req, res) => {
  try {
    await Collection.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Collection deleted' });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

app.get('/admincollections', async (req, res) => {
  try {
    const collections = await Collection.findAll();
    res.send(collections);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Admin coupon routes
app.post('/adminaddcoupon', async (req, res) => {
  try {
    const { name, amount, available } = req.body;
    if (!name || amount === undefined || available === undefined) {
      return res.status(400).send({ message: 'Validation error' });
    }
    const coupon = await Coupon.create({ name, amount, available });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

app.put('/adminupdatecoupon/:id', async (req, res) => {
  try {
    const { name, amount, available } = req.body;
    if (amount < 0 || available === undefined) {
      return res.status(400).send({ message: 'Validation error' });
    }
    const coupon = await Coupon.update({ name, amount, available }, { where: { id: req.params.id } });
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

app.delete('/admindeletecoupon/:id', async (req, res) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).send({ message: 'Server error' });
  }
});

app.get('/admincoupons', async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

// Product routes
app.get('/allproductsadmin', async (req, res) => {
  try {
    const category = req.query.category;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    const products = await Product.findAll({ where: filter });
    res.json(products);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/productadmin/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.put('/updateproductadmin/:id', upload.single('product'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send({ message: 'Product not found' });
    }
    const updatedData = {
      name: req.body.name,
      category_id: req.body.category_id,
      collection_id: req.body.collection_id,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      available: req.body.available,
    };
    if (req.file) {
      updatedData.image = `/images/${req.file.filename}`;
    }
    const updatedProduct = await product.update(updatedData);
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.post('/addproduct', async (req, res) => {
  try {
    const { name, category_id, collection_id, new_price, old_price, image } = req.body;
    if (!name || !category_id || isNaN(parseInt(category_id)) || !collection_id || isNaN(parseInt(collection_id)) || isNaN(parseFloat(new_price)) || isNaN(parseFloat(old_price))) {
      return res.status(400).json({ success: false, message: 'Invalid input. Required fields are missing or incorrect.' });
    }
    const product = await Product.create({
      name,
      image,
      category_id: parseInt(category_id),
      collection_id: parseInt(collection_id),
      new_price: parseFloat(new_price),
      old_price: parseFloat(old_price),
      available: true
    });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});


app.delete("/removeproduct/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await product.destroy();
    console.log("Removed");
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/newcollections', async (req, res) => {
  try {
    const products = await Product.findAll({ limit: 8 });
    res.send(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/allproducts', async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};
    if (category) {
      const categoryObj = await Category.findOne({ where: { name: category } });
      if (categoryObj) {
        filter.category_id = categoryObj.id;
      } else {
        return res.status(404).send('Category not found');
      }
    }
    const products = await Product.findAll({ where: filter });
    res.json(products);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.get('/popularinwomen', async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { category_id: 2 },
      limit: 4
    });
    res.send(products);
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});






/*
// Database Connection With MongoDB
mongoose.connect("mongodb+srv://testUser:TestPasswort78@cluster0.u4biwrc.mongodb.net/e-commerce").then(() => {
  console.log('MONGO DB connected!')
}).catch((err) => {
  console.log(err)
});
// paste your mongoDB Connection string above with password
// password should not contain '@' special character
*/

/*
// Schema for creating user model
const Users = mongoose.model("Users", {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isadmin: {
    type: Boolean,
    default: false,
  },
});

// Schema for creating Product
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number
  },
  old_price: {
    type: Number
  },
  date: {
    type: Date,
    default: Date.now,
  },
  avilable: {
    type: Boolean,
    default: true,
  },
});

app.get("/", (req, res) => {
  res.send("Root");
});

//Create an endpoint at ip/login for login the user and giving auth-token
app.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = {
        user: {
          id: user.id
        }
      }
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success, token });
    } else {
      return res.status(400).json({success: success, errors: "please try with correct email/password"})
    }
  } else {
    return res.status(400).json({success: success, errors: "please try with correct email/password"})
  }
})

/*
//Create an endpoint at ip/auth for regestring the user in data base & sending token
app.post('/signup', async (req, res) => {
  console.log("Sign Up");
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({ success: success, errors: "existing user found with this email" });
  }
  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id
    }
  }
  
  const token = jwt.sign(data, 'secret_ecom');
  success = true; 
  res.json({ success, token })
})

app.get("/allproducts", async (req, res) => {
  let products = await Product.findAll();
  console.log("All Products");
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  let products = await Product.findAll();
  let arr = products.slice(1).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.findAll();
  let arr = products.splice(0,  4);
  console.log("Popular In Women");
  res.send(arr);
});

/*   
app.get("/allproducts", async (req, res) => {
  let products = await Product.find({});
  console.log("All Products");
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  let products = await Product.find({});
  let arr = products.slice(1).slice(-8);
  console.log("New Collections");
  res.send(arr);
});

app.get("/popularinwomen", async (req, res) => {
  let products = await Product.find({});
  let arr = products.splice(0,  4);
  console.log("Popular In Women");
  res.send(arr);
});
*/

