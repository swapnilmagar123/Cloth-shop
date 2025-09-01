const express = require("express");
const router = express.Router();

// Contact form POST
router.get("/contact", (req, res) => {
  res.render("contact", { title: "Contact Us" });
});

// POST contact form
router.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    req.flash("error_msg", "⚠️ Please fill in all fields.");
    return res.redirect("/contact");
  }

  // Example: Save to DB / Send email
  console.log("📩 New Contact Form Submission:");
  console.log(`Name: ${name}, Email: ${email}, Message: ${message}`);

  req.flash("success_msg", " Thank you for reaching out! We'll reply soon.");
  res.redirect("/contact");
});

module.exports = router;
