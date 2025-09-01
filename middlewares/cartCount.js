// middleware/cartCount.js
const Cart = require("../models/Cart");

async function cartCountMiddleware(req, res, next) {
  try {
    if (req.user) {
      const cartItems = await Cart.find({ user: req.user._id });
      res.locals.cartCount = cartItems.length;
    } else {
      res.locals.cartCount = 0;
    }
  } catch (err) {
    res.locals.cartCount = 0;
  }
  next();
}

module.exports = cartCountMiddleware;
