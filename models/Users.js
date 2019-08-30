const mongoose = require("mongoose");
const Joi = require("joi");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const availableTags = [
  "python",
  "javascript",
  "java",
  "golang",
  "interview",
  "database",
  "10xcoder",
  "network",
  "database",
  "compiler",
  "concurrency"
];

const UsersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 15,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        return new Error("Email is not valid");
      }
    }
  },
  avatar: { type: String },
  likedPosts: { type: [String] },
  savedPosts: { type: [String] },
  myPosts: { type: [String] },
  tags: {
    type: [String],
    enum: availableTags,
    lowercase: true
  },
  hash: String,
  salt: String,
  confirmed: {
    type: Boolean,
    default: false,
    required: true
  },
  confirmation: String,
  passwordReset: { type: String, select: false },
  draft: String,
  bio: { type: String, default: "Your Biography" }
});

UsersSchema.methods.setPassword = function(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
};

UsersSchema.methods.validatePassword = function(password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 10000, 512, "sha512")
    .toString("hex");
  return this.hash === hash;
};

UsersSchema.methods.generateJWT = function() {
  return jwt.sign(
    {
      _id: this._id,
      username: this.email,
      password: this.password
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

UsersSchema.methods.userView = function() {
  return {
    email: this.email,
    username: this.username,
    likeTags: this.likeTags,
    avatar: this.avatar
  };
};

UsersSchema.methods.toAuthJSON = function() {
  return {
    username: this.username,
    email: this.email,
    token: this.generateJWT(),
    id: this._id,
    likedPosts: this.likedPosts,
    myPosts: this.myPosts,
    avatar: this.avatar,
    bio: this.bio
  };
};

const User = mongoose.model("User", UsersSchema);

const validateUser = user => {
  const joiUserSchema = {
    username: Joi.string()
      .required()
      .min(5)
      .max(15),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
      .min(8)
      .max(20),
    tags: Joi.array()
  };
  return Joi.validate(user, joiUserSchema);
};

module.exports.User = User;
module.exports.userValidator = validateUser;
