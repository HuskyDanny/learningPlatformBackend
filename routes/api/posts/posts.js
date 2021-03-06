const { postValidator, Post } = require("../../../models/Posts");
const { User } = require("../../../models/Users");
const { Router } = require("express");
const auth = require("../../auth");
const { index, algoliaSchema } = require("../../../config/algolia");
const router = Router();
const {
  Comment,
  commentValidator,
  Reply,
  replyValidator
} = require("../../../models/Comments");
const _ = require("lodash");

router.get("/", auth.required, async (req, res) => {
  try {
    const posts = await Post.find();
    return res.send(posts);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/:id", auth.optional, async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });

    if (!post) return res.status(400).json("Not Found");
    return res.send(post);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.patch("/avatar/:userId", auth.required, async (req, res) => {
  try {
    const posts = Post.updateMany(
      { userId: req.params.userId },
      { avatar: req.body.avatar }
    );

    const comments = Post.updateMany(
      {},
      {
        $set: { "comments.$[elem].avatar": req.body.avatar }
      },
      { arrayFilters: [{ "elem.userId": req.params.userId }] }
    );

    const result = await Promise.all([posts, comments]);

    return res.json({
      postModified: result[0].nModified,
      commentsModified: result[1].nModified
    });
  } catch (error) {
    return res.status(500);
  }
});

router.post("/", auth.required, async (req, res, next) => {
  try {
    const result = await postValidator(req.body);
    if (result.error) return res.status(400).send(error.message);

    //check the user verified or not
    const user = await User.findById({ _id: result.userId });
    if (!user) return res.status(400).send({ message: "user not found" });
    if (!user.confirmed)
      return res.status(422).send({ message: "user not verified" });

    //save to db
    const dbSchema = {
      title: result.title,
      author: result.author,
      content: result.content,
      tags: result.tags ? result.tags : [],
      likes: result.likes ? result.likes : 0,
      post_date_timestamp: new Date().getTime(),
      userId: result.userId,
      avatar: result.avatar
    };

    let post = new Post(dbSchema);
    post = await post.save();

    //save to algolia
    let algoSchema = _.pick(post, algoliaSchema);
    algoSchema["objectID"] = post._id;
    await index.addObjects([algoSchema]);

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    return res.status(412).json(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await index.deleteObject(req.params.id);

    if (!result) return res.status(400);

    await Post.findOneAndDelete({ _id: req.params.id });

    res.json({ message: "deleted" });
  } catch (error) {
    res.status(500);
  }
});

router.patch("/likes/:id", auth.required, async (req, res) => {
  const increment = req.body.liked ? -1 : 1;

  try {
    // const content = await index.getObject(req.params.id, ["likes"]);

    const content = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $inc: { likes: increment } },
      { new: true }
    );
    //Because the aync feature of algolia
    //We have to waittask for its update to keep consistency
    await index.partialUpdateObject({
      likes: content.likes,
      objectID: req.params.id
    });
    res.json({ message: "success" });
  } catch (error) {
    console.log(error);
    return res.json({ message: error.message });
  }
});

router.patch("/comments/:id", auth.required, async (req, res) => {
  try {
    const { error } = await commentValidator(req.body.comment);

    if (error) return res.status(400).send(error.message);

    const comment = new Comment(req.body.comment);

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        $push: {
          comments: comment
        }
      },
      { new: true }
    );

    if (!post) return res.status(400).send("Post not Found");

    return res.json(comment);
  } catch (error) {
    console.log(error);
    return res.status(403).send(error.message);
  }
});

router.delete("/comments/:id", async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      {
        $pull: { comments: { _id: req.query.commentId } }
      },
      { new: true }
    );

    if (!post) return res.status(400).send("Post not Found");

    return res.json(post);
  } catch (error) {
    return res.status(403).send(error.message);
  }
});

router.patch("/tags/:id", auth.required, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { tags: req.body.tags },
      { new: true }
    );

    if (!post) return res.status(400).send("Post not Found");

    return res.json(post);
  } catch (error) {
    return res.json(error);
  }
});

router.patch("/comments/reply/:id", auth.required, async (req, res) => {
  try {
    const { error } = await replyValidator(req.body.reply);
    if (error) return res.status(400).send(error.message);

    let post = await Post.findOne({ _id: req.params.id });

    let result = await post.comments.id(req.query.commentId);

    let newReply = new Reply(req.body.reply);
    result.replies.push(newReply);

    post = await post.save();

    res.json(newReply);
  } catch (error) {
    res.json(error.message);
  }
});

router.delete("/comments/reply/:postId", auth.required, async (req, res) => {
  try {
    let post = await Post.findOne({ _id: req.params.postId });

    let result = await post.comments.id(req.query.commentId);

    await result.replies.id(req.query.replyId).remove();

    post = await post.save();

    res.json(post);
  } catch (error) {
    res.json(error.message);
  }
});

module.exports = router;
