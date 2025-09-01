const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const isLoggedIn = require("../middlewares/isLoggedIn");

// Cart page
router.get("/", (req, res) => {
  if (!req.session.cart) req.session.cart = [];
  res.render("cart", { cart: req.session.cart });
});

// Add to cart (increments qty if already present)
router.get("/add/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect("/products");
    }

    if (!req.session.cart) req.session.cart = [];

    const idx = req.session.cart.findIndex(
      (p) => String(p._id) === String(product._id)
    );

    if (idx > -1) {
      req.session.cart[idx].qty += 1;
    } else {
      req.session.cart.push({
        _id: String(product._id),
        brand: product.brand,
        type: product.type,
        image: product.image,
        color: product.color,
        price: product.price,
        qty: 1,
      });
    }

    req.flash("success_msg", `${product.brand} added to cart`);
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/products");
  }
});


// Remove product from session cart
router.post("/remove/:id", (req, res) => {
  try {
    if (!req.session.cart) req.session.cart = [];
    const before = req.session.cart.length;
    req.session.cart = req.session.cart.filter(
      (item) => String(item._id) !== String(req.params.id)
    );

    if (req.session.cart.length < before) {
      req.flash("success_msg", "Product removed from cart");
    } else {
      req.flash("error_msg", "Product not found in cart");
    }
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/cart");
  }
});

// Optional: Buy Now (demo) — places a single-item order and removes it from cart
// Buy Now route
router.get("/buy/:id", isLoggedIn, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      req.flash("error_msg", "Product not found");
      return res.redirect("/products");
    }

    // render from productbuy folder
    res.render("productbuy/process", { product });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Something went wrong");
    res.redirect("/products");
  }
});



module.exports = router;
