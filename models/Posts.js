const { Router } = require("express");
const mongoose = require("mongoose");
const { commentSchema } = require("../models/Comments");
const Joi = require("joi");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tags: {
    type: [String],
    lowercase: true
  },
  likes: { type: Number },
  post_date_timestamp: {
    type: Number
  },
  author: { type: String, require: true },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  comments: [commentSchema],
  avatar: { type: String }
});

const Post = mongoose.model("Post", postSchema);

const validatePost = post => {
  const joiPostSchema = {
    userId: Joi.string().required(),
    title: Joi.string()
      .required()
      .min(5)
      .max(50),
    author: Joi.string().required(),
    content: Joi.string().required(),
    tags: Joi.array().required(),
    likes: Joi.number(),
    avatar: Joi.string()
  };
  return Joi.validate(post, joiPostSchema);
};
module.exports.Post = Post;
module.exports.postValidator = validatePost;
