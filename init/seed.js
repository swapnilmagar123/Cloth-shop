const mongoose = require("mongoose");
const Product = require("../models/product");
const products = require("./data");

mongoose.connect("mongodb://127.0.0.1:27017/cloth-shop")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const initDB = async () => {
  try {
    await Product.deleteMany({});
    console.log("🗑️ Old Products Removed");

    await Product.insertMany(products);
    console.log("✅ Fake Products Inserted!");

    const count = await Product.countDocuments();
    console.log(`📦 Total products now: ${count}`);
  } catch (err) {
    console.error("❌ Error inserting products:", err);
  } finally {
    mongoose.connection.close();
  }
};

initDB();
