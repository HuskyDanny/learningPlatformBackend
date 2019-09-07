const mongoose = require("mongoose");
const Joi = require("joi");

const replySchema = new mongoose.Schema({
  body: { type: String, required: true },
  post_date_timestamp: {
    type: Number
  },
  like: { type: Number, default: 0 },
  username: { type: String, required: true },
  userID: { type: String, required: true }
});

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  post_date_timestamp: {
    type: Number
  },
  like: { type: Number, default: 0 },
  replies: [replySchema],
  username: { type: String, required: true },
  userId: { type: String, required: true },
  avatar: { type: String },
  reputation: { type: Number, required: true, default: 0 },
  knowledge: { type: Number, required: true, default: 0 }
});

const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);

const commentValidator = comment => {
  const joiCommentSchema = {
    body: Joi.string().required(),
    replies: Joi.array(),
    username: Joi.string().required(),
    userId: Joi.string().required(),
    post_date_timestamp: Joi.number().required(),
    avatar: Joi.string(),
    reputation: Joi.number(),
    knowledge: Joi.number()
  };

  return Joi.validate(comment, joiCommentSchema);
};

const replyValidator = reply => {
  const joiReplySchema = {
    body: Joi.string().required(),
    date: Joi.string(),
    username: Joi.string()
      .required()
      .error(new Error("empty username")),
    userID: Joi.string().required(),
    post_date_timestamp: Joi.number().required()
  };
  return Joi.validate(reply, joiReplySchema);
};

module.exports.Comment = Comment;
module.exports.commentSchema = commentSchema;
module.exports.Reply = Reply;
module.exports.commentValidator = commentValidator;
module.exports.replyValidator = replyValidator;
