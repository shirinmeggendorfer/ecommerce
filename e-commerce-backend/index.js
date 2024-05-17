const expressPort = 4001;
const jestPort = 5061;
const express = require("express");
const app = express();
const router = express.Router();
//const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3005', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const { Sequelize, DataTypes } = require('sequelize');

// POSTGRES DB VERBINDUNG
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});

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


sequelize.authenticate()
  .then(() => {
    console.log('Erfolgreich mit der PostgreSQL-Datenbank verbunden!');
  })
  .catch(err => {
    console.error('Fehler bei der Verbindung zur PostgreSQL-Datenbank:', err);
  });

const server = app.listen(expressPort, () => {
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




// Image Storage Engine 
const storage = multer.diskStorage({
  destination: './images',
  filename: (req, file, cb) => {
    console.log(file);
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
})
const upload = multer({storage: storage})

app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:4001/upload/images/${req.file.filename}`
  })
})
app.use('/images', express.static('upload/images'));



// MiddleWare to fetch user from database
const fetchuser = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Authorization Header:", authHeader); // Log the received auth header

  const token = authHeader && authHeader.split(' ')[1]; // Extract token
  if (!token) {
    console.error("No token provided");
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = await User.findOne({ where: { id: data.user.id } });
    if (!req.user) {
      console.error("User not found with provided token");
      return res.status(401).send({ errors: "User not found" });
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).send({ errors: "Invalid token" });
  }
};


// Middleware to check if the user is an admin
const fetchAdmin = async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(' ')[1]; // Extract token

  if (!token) {
    return res.status(401).send({ errors: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, "secret_ecom");
    console.log("Decoded token data:", data); // Log decoded token data
    req.user = await User.findOne({ where: { id: data.user.id } });
    if (!req.user || !req.user.is_admin) {
      console.error("Access denied. Admins only.");
      return res.status(403).send({ errors: "Access denied" });
    }
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).send({ errors: "Invalid token" });
  }
};


// ROUTES

//ADMINCHECK
app.get('/admin/dashboard', fetchAdmin, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard' });
});

app.get('/me', fetchuser, async (req, res) => {
  try {
    res.json({ id: req.user.id, email: req.user.email, is_admin: req.user.is_admin });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// FEATURE #1 : REGISTRIERUNG
app.post('/signup', async (req, res) => {
  try {
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({ success: false, errors: "Ein Benutzer mit dieser E-Mail existiert bereits" });
    }

    const newUser = await User.create({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password
    });

    const tokenData = { user: { id: newUser.id } };
    const token = jwt.sign(tokenData, 'secret_ecom');
    res.status(200).json({ success: true, token }); // Antwort geändert
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});


// FEATURE #2 : LOGIN
app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && user.password === req.body.password) {
      const tokenData = { user: { id: user.id } };
      const token = jwt.sign(tokenData, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, errors: "Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort" });
    }
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});

// FEATURE #2 : ADMIN LOGIN
app.post('/adminlogin', async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && user.password === req.body.password) {
      if (!user.is_admin) {
        return res.status(403).json({ success: false, errors: "Access denied. Admins only." });
      }
      const tokenData = { user: { id: user.id, is_admin: user.is_admin } };
      const token = jwt.sign(tokenData, 'secret_ecom');
      res.json({ success: true, token });
    } else {
      res.status(400).json({ success: false, errors: "Bitte überprüfen Sie Ihre E-Mail-Adresse und Ihr Passwort" });
    }
  } catch (error) {
    res.status(500).send('Interner Serverfehler');
  }
});



// FEATURE #2 : LOGOUT
app.post('/logout', fetchuser, async (req, res) => {
  try {
    await User.update({ cart_data: {} }, { where: { id: req.user.id } });
    res.send({ success: true, message: "Logged out and cart cleared" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

// FEATURE #3 : EINKAUF
app.post('/addtocart', fetchuser, async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.cart_data = user.cart_data || {};
    user.cart_data[req.body.itemId] = (user.cart_data[req.body.itemId] || 0) + 1;
    await User.update({ cart_data: user.cart_data }, { where: { id: req.user.id } });

    res.json({ message: "Item added successfully", cartData: user.cart_data });
  } catch (error) {
    res.status(500).send({ message: "Error adding item to cart", error: error.toString() });
  }
});

// FEATURE #3 : EINKAUF
app.post('/removefromcart', cors(), fetchuser, async (req, res) => {
  try {
    const { itemId, removeAll } = req.body;
    let user = await User.findOne({ where: { id: req.user.id } });
    if (!user || !user.cart_data) return res.status(404).send("User or cart not found.");

    if (removeAll || user.cart_data[itemId] <= 1) {
      delete user.cart_data[itemId];
    } else {
      user.cart_data[itemId] -= 1;
    }

    await User.update({ cart_data: user.cart_data }, { where: { id: req.user.id } });
    res.json({ success: true, cartData: user.cart_data });
  } catch (error) {
    console.error("Error modifying cart:", error);
    res.status(500).send("Internal Server Error");
  }
});

// FEATURE #3 : EINKAUF
async function updateCartItem(userId, itemId, removeAll) {
  // Finde den Benutzer und aktualisiere den Warenkorb entsprechend
  let user = await User.findOne({ where: { id: userId } });
  if (!user || !user.cart_data) return null;

  if (removeAll || user.cart_data[itemId] <= 1) {
    delete user.cart_data[itemId];
  } else {
    user.cart_data[itemId] -= 1;
  }

  // Aktualisiere den Benutzer in der Datenbank
  await User.update({ cart_data: user.cart_data }, { where: { id: userId } });

  return user.cart_data;
}

// FEATURE #3 : EINKAUF
app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await User.findOne({_id:req.user.id});
  res.json(userData.cartData);
})

// FEATURE #4 : PRODUCTSUCHE
app.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.findAll({
      where: {
        name: {
          [Sequelize.Op.iLike]: `%${query}%` 
        }
      }
    });
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Internal Server Error');
  }
});


// FEATURE #5 : KATEGORIE HINZUFÜGEN
app.post('/adminaddcategory', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ name });
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #6 : KATEGORIE BEARBEITEN
app.put('/adminupdatecategory/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.update({ name }, {
      where: { id: req.params.id }
    });
    res.json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #7 : KATEGORIE LÖSCHEN
app.delete('/admindeletecategory/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Category.destroy({
      where: { id }
    });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #8 : KATEGORIE AUFLISTEN
app.get('/admincategories', async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send('Internal Server Error');
  }
});

// FEATURE #9 : COLLECTION HINZUFÜGEN
app.post('/adminaddcollection', async (req, res) => {
  try {
    const { name } = req.body;
    const collection = await Collection.create({ name });
    res.json({ success: true, collection });
  } catch (error) {
    console.error("Error adding collection:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #10 : COLLECTION BEARBEITEN
app.put('/adminupdatecollection/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const collection = await Collection.update({ name }, {
      where: { id: req.params.id }
    });
    res.json({ success: true, collection });
  } catch (error) {
    console.error("Error updating collection:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #11 : COLLECTION LÖSCHEN
app.delete('/admindeletecollection/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Collection.destroy({
      where: { id }
    });
    res.json({ success: true, message: 'collection deleted' });
  } catch (error) {
    console.error("Error deleting collection:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #12 : COLLECTION AUFLISTEN
app.get('/admincollections', async (req, res) => {
  try {
    // Abrufen aller Collections aus der Datenbank
    const collections = await Collection.findAll();
    console.log("All Collections:", collections);
    res.send(collections);
  } catch (error) {
    console.error('Fehler beim Abrufen aller Collections:', error);
    res.status(500).send('Interner Serverfehler');
  }
});

// FEATURE #13 : COUPON HINZUFÜGEN
app.post('/adminaddcoupon', async (req, res) => {
  try {
    const { name, amount, available } = req.body;
    const coupon = await Coupon.create({ name, amount, available });
    res.json({ success: true, coupon });
  } catch (error) {
    console.error("Error adding coupon:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #14 : COUPON BEARBEITEN
app.put('/adminupdatecoupon/:id', async (req, res) => {
  try {
    const { name, amount, available } = req.body;
    const coupon = await Coupon.update({ name, amount, available }, {
      where: { id: req.params.id }
    });
    res.json({ success: true, coupon });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #15 : COUPON LÖSCHEN
app.delete('/admindeletecoupon/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Coupon.destroy({
      where: { id }
    });
    res.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).send({ success: false, message: error.message });
  }
});

// FEATURE #16 : COUPON AUFLISTEN
app.get('/admincoupons', async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).send('Internal Server Error');
  }
});

// FEATURE #17 : PRODUKTE AUFLISTEN
app.get("/allproductsadmin", async (req, res) => {
  try {
    const category = req.query.category;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    const products = await Product.findAll({
      where: filter
    });
    res.json(products);
  } catch (error) {
    console.error('Fehler beim Abrufen der Produkte:', error);
    res.status(500).send('Interner Serverfehler');
  }
});

// FEATURE #18 : PRODUKTE ANZEIGEN
app.get("/productadmin/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error('Error retrieving product:', error);
    res.status(500).send('Internal Server Error');
  }
});

// FEATURE #17 : PRODUKTE BEARBEITEN
app.put("/updateproductadmin/:id", upload.single('image'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }
    const updatedData = {
      name: req.body.name,
      image: req.file ? req.file.path : product.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
      available: req.body.available
    };
    const updatedProduct = await product.update(updatedData);
    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});


// FEATURE #19 : PRODUKTE HINZUFÜGEN
app.post("/addproduct", async (req, res) => {
  try {
    const { name, category_id, collection_id, new_price, old_price, image } = req.body;

    // Prüfen, ob die erforderlichen Felder vorhanden und korrekt sind
    if (!name || !category_id || isNaN(parseInt(category_id)) || !collection_id || isNaN(parseInt(collection_id)) || isNaN(parseFloat(new_price)) || isNaN(parseFloat(old_price))) {
      return res.status(400).json({ success: false, message: "Invalid input. Required fields are missing or incorrect." });
    }

    // Konvertieren von Daten, um sicherzustellen, dass sie den korrekten Typ haben
    const product = await Product.create({
      name,
      image: image,  // Verwenden Sie den übergebenen Bildpfad
      category_id: parseInt(category_id),
      collection_id: parseInt(collection_id),
      new_price: parseFloat(new_price),
      old_price: parseFloat(old_price),
      available: true // oder andere Logik zur Bestimmung der Verfügbarkeit
    });

    res.json({ success: true, product });
  } catch (error) {
    console.error("Failed to add product:", error);
    res.status(500).send("Internal Server Error");
  }
});

// FEATURE #20 : PRODUKTE LÖSCHEN
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



// STARTSEITE
app.get("/newcollections", async (req, res) => {
  try {
    let products = await Product.findAll({
      limit: 8  // Anpassung, um nur eine bestimmte Anzahl von Produkten zurückzugeben
    });
    console.log("New Collections:", products);
    res.send(products);
  } catch (error) {
    console.error('Fehler beim Abrufen der neuen Kollektionen:', error);
    res.status(500).send('Interner Serverfehler');
  }
});

// STARTSEITE
app.get("/allproducts", async (req, res) => {
  try {
    // Abrufen aller Produkte aus der Datenbank
    const products = await Product.findAll();
    console.log("All Products:", products);
    res.send(products);
  } catch (error) {
    console.error('Fehler beim Abrufen aller Produkte:', error);
    res.status(500).send('Interner Serverfehler');
  }
});



// STARTSEITE
app.get("/popularinwomen", async (req, res) => {
  try {
    // Abrufen aller Produkte aus der Datenbank, die zur Kategorie "women" gehören
    const products = await Product.findAll({
      where: {
        category_id: 2
      },
      limit: 4 // Begrenzen Sie die Anzahl der zurückgegebenen Produkte auf 4
    });

    console.log("Popular In Women:", products);
    res.send(products);
  } catch (error) {
    console.error('Fehler beim Abrufen der beliebtesten Produkte für Frauen:', error);
    res.status(500).send('Interner Serverfehler');
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



// TESTSERVER KONFIGURATION Jest-Server
const jestApp = express();

jestApp.use(express.json());

jestApp.get("/", (req, res) => {
  res.send("Jest Server is running");
});

jestApp.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@example.com' && password === 'password') {
    return res.json({ success: true, token: 'mocked_token' });
  } else {
    return res.status(400).json({ success: false, errors: "Invalid credentials" });
  }
});

jestApp.post('/signup', (req, res) => {
  if (!req.body.checkbox) {
    return res.status(400).json({ success: false, errors: "You must agree to the terms and conditions to sign up." });
  }

  const existingUser = false; // Mock the existing user check

  if (existingUser) {
    return res.status(400).json({ success: false, errors: "Ein Benutzer mit dieser E-Mail existiert bereits" });
  }

  // Mock user creation
  const newUser = {
    id: 1,
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  const tokenData = { user: { id: newUser.id } };
  const token = 'mocked_token'; // Mock token

  res.status(200).json({ success: true, token });
});



jestApp.post('/addtocart', (req, res) => {
  return res.json({ message: 'Item added successfully' });
});

jestApp.post('/addproduct', (req, res) => {
  return res.json({ success: true, product: { ...req.body, id: 1 } });
});

jestApp.put('/updateproductadmin/:id', (req, res) => {
  return res.json({ success: true, product: { ...req.body, id: req.params.id } });
});

jestApp.delete('/removeproduct/:id', (req, res) => {
  return res.json({ success: true });
});

jestApp.get('/allproductsadmin', (req, res) => {
  return res.json([
    { id: 1, name: 'Product 1', price: 100, category_id: 1, collection_id: 1 },
    { id: 2, name: 'Product 2', price: 200, category_id: 2, collection_id: 2 }
  ]);
});

const jestServer = jestApp.listen(jestPort, () => {
  console.log(`Jest Server is running on port ${jestPort}`);
});
