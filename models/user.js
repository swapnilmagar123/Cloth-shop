const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: false,
    unique: false,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
  },
  mobile: {
    type: String,
    required: false,
    unique: false,
    match: [/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number"]
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  age: {
    type: Number,
    required: true,
    min: 13
  }
});

// Hash password before saving (ONLY once)
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with stored hash
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;
