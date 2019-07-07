const mongoose = require("mongoose");
const Joi = require("joi");

const replySchema = new mongoose.Schema({
  body: { type: String, required: true },
  post_date_timestamp: {
    type: Number,
    default: new Date().getTime()
  },
  like: { type: Number, default: 0 },
  username: { type: String, required: true },
  userID: { type: String, required: true }
});

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true },
  post_date_timestamp: {
    type: Number,
    default: new Date().getTime()
  },
  like: { type: Number, default: 0 },
  replies: [replySchema],
  username: { type: String, required: true },
  userID: { type: String, required: true }
});

const Comment = mongoose.model("Comment", commentSchema);
const Reply = mongoose.model("Reply", replySchema);

const commentValidator = comment => {
  const joiCommentSchema = {
    body: Joi.string().required(),
    date: Joi.string(),
    replies: Joi.array(),
    username: Joi.string().required(),
    userID: Joi.string().required()
  };
  return Joi.validate(comment, joiCommentSchema);
};

const replyValidator = reply => {
  const joiReplySchema = {
    body: Joi.string().required(),
    date: Joi.string(),
    username: Joi.string().required(),
    userID: Joi.string().required()
  };
  return Joi.validate(reply, joiReplySchema);
};

module.exports.Comment = Comment;
module.exports.commentSchema = commentSchema;
module.exports.Reply = Reply;
module.exports.commentValidator = commentValidator;
module.exports.replyValidator = replyValidator;
