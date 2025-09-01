const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  type: { type: String, required: true },   // e.g. "T-Shirt", "Shoes", "Jeans"
  color: { type: String, required: true },
  gender: { type: String, enum: ["Men", "Women", "Unisex"], required: true },
  sizes: [{ type: String }],                // array of available sizes, e.g. ["S", "M", "L", "XL"]
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  image: { type: String, required: true }   // image URL (we can store file path or cloud URL)
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
