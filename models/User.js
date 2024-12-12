const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    select: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: Number,
  },
  verificationCode: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  refreshToken: { type: String, default: null },

  createdElections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election", // Reference tới model Election
    },
  ],

  participatedElections: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Election", // Reference tới model Election
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
