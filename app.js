const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/db");
const products = require("./init/data"); // import fake data
const productRoutes = require("./routes/products");
const ejsMate = require("ejs-mate");
const authRoutes = require("./routes/auth");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const session = require("express-session");

const cartRoutes = require("./routes/cart");
const cartCountMiddleware = require("./middlewares/cartCount");

const contactRoutes = require("./routes/contact");




// const multer = require("multer");
// Load env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();








// Session middleware
app.use(session({
  secret: "mysecret",      // change in production
  resave: false,
  saveUninitialized: false
}));

// Flash middleware
app.use(flash());

// Make flash messages available in all views


app.use(async (req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.user = req.session.user || null;

  try {
    if (req.session.user) {
      const cartCount = await Cart.countDocuments({ user: req.session.user._id });
      res.locals.cartCount = cartCount;
    } else {
      res.locals.cartCount = 0;
    }
  } catch (err) {
    res.locals.cartCount = 0;
  }

  next();
});



// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/home", productRoutes);
app.use("/", authRoutes);  
// app.use("/cart", isLoggedIn);

// Layouts
app.engine("ejs", ejsMate);
app.use(expressLayouts);
app.set("layout", "layout"); 
app.use("/cart", cartRoutes);
app.use("/products", productRoutes);
app.use(cartCountMiddleware);
app.use("/", contactRoutes);

// EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



// Global flash variables (accessible in all views)


// Public
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.render("home", { title: "Cloth Shop Home" });
});


// Add Product Page
function ensureAuth(req, res, next) {
  if (req.session.user) {
    return next();
  }
  req.flash("error_msg", "⚠️ Please log in to add products");
  res.redirect("/");
}

app.get("/products/add", ensureAuth, (req, res) => {
  res.render("products/addproduct", { title: "Add Product" });
});

app.post("/products/add", ensureAuth, async (req, res) => {
  try {
    const { brand, name, gender, color, size, price, discount } = req.body;
    const newProduct = new Product({ brand, name, gender, color, size, price, discount });
    await newProduct.save();
    req.flash("success_msg", "✅ Product added successfully!");
    res.redirect("/");
  } catch (err) {
    req.flash("error_msg", "❌ Error adding product: " + err.message);
    res.redirect("/products/addproduct");
  }
});



app.post("/login", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (!user) {
      req.flash("error_msg", "❌ Invalid username or email");
      return res.redirect("/");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      req.flash("error_msg", "❌ Invalid password");
      return res.redirect("/");
    }

    // ✅ Store logged-in user in session
    req.session.user = user;

    req.flash("success_msg", "✅ Login successful!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "⚠️ Server error, please try again");
    res.redirect("/");
  }
});

app.get("/logout", (req, res, next) => {
  // store the message first
  req.flash("success_msg", "✅ You have logged out successfully!");

  // destroy session
  req.session.destroy((err) => {
    if (err) return next(err);
    // redirect after session is destroyed
    res.redirect("/products");
  });
});




app.get("/about", (req, res) => {
  res.render("about", { user: req.user });
});







// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
