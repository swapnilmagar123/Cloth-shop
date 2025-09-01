const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const isLoggedIn = require("../middlewares/isLoggedIn");

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ================= ADD PRODUCT =================
router.get("/addproduct", isLoggedIn, (req, res) => {
  res.render("products/addproduct", { title: "Add Product" });
});

router.post("/addproduct", isLoggedIn, upload.single("imageFile"), async (req, res) => {
  try {
    const { brand, type, color, gender, sizes, price, discount, imageLink } = req.body;
    let imagePath = imageLink || (req.file ? "/uploads/" + req.file.filename : null);
    if (!imagePath) {
      req.flash("error_msg", "⚠️ Please provide an image");
      return res.redirect("/products/addproduct");
    }

    const product = new Product({
      brand,
      type,
      color,
      gender,
      sizes: sizes.split(",").map(s => s.trim()),
      price,
      discount: discount || 0,
      image: imagePath
    });

    await product.save();
    req.flash("success_msg", "✅ Product added successfully!");
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "❌ Error adding product: " + err.message);
    res.redirect("/products/addproduct");
  }
});

// ================= EDIT PRODUCT =================
router.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect("/products");
    }
    res.render("products/edit", { title: "Edit Product", product });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error fetching product");
    res.redirect("/products");
  }
});

// POST Edit product
router.post("/edit/:id", isLoggedIn, upload.single("imageFile"), async (req, res) => {
  try {
    const { brand, type, color, gender, sizes, price, discount, imageLink } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect("/products");
    }

    // Update fields
    product.brand = brand;
    product.type = type;
    product.color = color;
    product.gender = gender;
    product.sizes = sizes.split(",").map(s => s.trim());
    product.price = price;
    product.discount = discount || 0;

    // If user uploaded a new file, use it
    if (req.file) {
      product.image = "/uploads/" + req.file.filename;
    } else if (imageLink) {
      product.image = imageLink;
    }

    await product.save();
    req.flash("success_msg", "Product updated successfully!");
    res.redirect(`/products/${product._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error updating product");
    res.redirect("/products");
  }
});


// ================= DELETE PRODUCT =================
router.post("/delete/:id", isLoggedIn, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "✅ Product deleted successfully!");
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error deleting product");
    res.redirect("/products");
  }
});

// ================= SHOW SINGLE PRODUCT =================
router.get("/show/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect("/products");
    }
    res.render("products/show", { title: product.brand, product, user: req.session.user });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error fetching product");
    res.redirect("/products");
  }
});

// ================= LIST ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("products/index", { title: "Products", products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching products");
  }
});

module.exports = router;
