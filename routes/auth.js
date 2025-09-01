const express = require("express");
const User = require("../models/user")

const router = express.Router();

// Show signup page
router.get("/signup", (req, res) => {
  res.render("login/signup");
});

// Show login page
router.get("/login", (req, res) => {
  res.render("login/login");
});

// Handle signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, mobile, age, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      req.flash("error_msg", "Email or Mobile already registered!");
      return res.redirect("/signup");
    }

    // ❌ No manual hashing here → handled by pre("save") in User.js
    const newUser = new User({ username, email, mobile, age, password });
    await newUser.save();

    req.flash("success_msg", "Signup successful! Please login.");
    res.redirect("/login");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error signing up!");
    res.redirect("/signup");
  }
});

// Handle login
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });

    if (!user) {
      req.flash("error_msg", "User not found!");
      return res.redirect("/login");
    }

    const validPassword = await user.matchPassword(password);
    if (!validPassword) {
      req.flash("error_msg", "Invalid password!");
      return res.redirect("/login");
    }

    // ✅ Save user in session
    req.session.user = { id: user._id, username: user.username };

    req.flash("success_msg", "Login successful!");
    res.redirect("/products");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "Error logging in!");
    res.redirect("/login");
  }
});

module.exports = router;
