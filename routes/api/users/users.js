const { userValidator, User } = require("../../../models/Users");
const { OTC } = require("../../../models/OTC");
const { Router } = require("express");
const passport = require("passport");
const auth = require("../../auth");
const sgMail = require("../../../config/sgMail");
const jwt = require("jsonwebtoken");
const router = Router();
const s3 = require("../../../config/aws");
const multer = require("multer");
const multerS3 = require("multer-s3");
const randomize = require("randomatic");

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "profileimagelearningplatform",
    metadata: function(req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      cb(null, new Date().toISOString() + "_" + file.originalname); //use Date.now() for unique file keys
    }
  })
});

router.patch("/draft/:id", auth.required, (req, res) => {
  if (req.body.content) {
    User.findOneAndUpdate({ _id: req.params.id }, { draft: req.body.content })
      .then(() => res.send({ message: "saved" }))
      .catch(err => {
        console.log(err);
        res.status(500).json({ message: "failed" });
      });
  }
});

router.get("/draft/:id", auth.required, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then(user => res.json({ content: user.draft }))
    .catch(err => res.status(500).json({ message: "failed" }));
});

router.patch("/bio/:id", auth.required, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      { bio: req.body.bio }
    );
    res.json(user.toAuthJSON());
  } catch (error) {
    res.status(500).json({ message: "bio not updated" });
  }
});

router.patch(
  "/profile/:id",
  auth.required,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: req.params.id },
        { avatar: req.file.location },
        { new: true }
      );

      res.json(user.toAuthJSON());
    } catch (error) {
      res.status(500).json({ message: "failed upload" });
    }
  }
);

router.get("/comfirmation/:token", auth.optional, async (req, res) => {
  const secret = process.env.JWT_SECRET;
  const redirectUrl =
    process.env.REDIRECTURL || "http://localhost:3001/confirmation";
  try {
    const { _id } = jwt.verify(req.params.token, secret);
    await User.findOneAndUpdate({ _id: _id }, { confirmed: true });
    res.redirect(redirectUrl);
  } catch (error) {
    res.json(error.message);
  }
});

router.get("/all", auth.required, async (req, res) => {
  try {
    let users = await User.find();
    users = users.map(user => user.userView());
    return res.json(users);
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.get("/", auth.required, async (req, res) => {
  const {
    payload: { _id }
  } = req;

  try {
    const user = await User.findOne({ _id: _id });
    if (!user) return res.status(400).json("User not Found");
    return res.json({ user: user.userView() });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

router.patch("/tags/:id", auth.required, async (req, res) => {
  const {
    body: { tags },
    params: { id }
  } = req;

  try {
    const user = await User.findOneAndUpdate(
      { _id: id },
      { tags: tags },
      { new: true }
    );
    return res.json(user.userView());
  } catch (error) {
    return res.json(error.message);
  }
});

router.post("/signup", auth.optional, async (req, res) => {
  //wrap everything as user
  const {
    body: { user }
  } = req;

  //validate content
  const { error } = userValidator(user);

  if (error) return res.status(400).json(error.message);

  //salt and hash the newuser
  let newUser = new User(user);
  newUser.setPassword(user.password);

  //save to mongodb
  try {
    newUser = await newUser.save();

    const url = `${
      process.env.BACKEND_SERVER
    }/api/users/comfirmation/${newUser.generateJWT()}`;

    //Use smtp service for email verification
    const msg = {
      to: newUser.email,
      from: "welcome@techleak.com",
      templateId: "d-55aeeafbdc834ef7879e7f33c5726199",
      subject: "Welcome To Techleak, Enjoy Learning",
      dynamic_template_data: {
        username: newUser.username,
        url: url
      }
    };

    sgMail.send(msg);

    return res.json(newUser.toAuthJSON());
  } catch (error) {
    //duplicate error return to user
    console.log(error);
    if (error.code === 11000) {
      let message = { email: "", username: "" };
      if (error.errmsg.includes("email")) {
        message.email = "email has been taken";
      }
      if (error.errmsg.includes("username")) {
        message.username = "username has been taken";
      }
      return res.status(400).json(message);
    }
  }
});

// Send confirmation email to user
router.post("/reset-send-email", auth.optional, async (req, res) => {
  const email = req.body.email;
  const confirmation = randomize("0A", 6);

  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not exist" });

    await OTC.findOneAndUpdate(
      { email: email },
      { confirmation: confirmation },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const msg = {
      to: email,
      from: "welcome@techleak.com",
      templateId: "d-6dea1ef361ce40b5a0b9d1ba94640c6f",
      subject: "Password Reset Confirmation Code",
      dynamic_template_data: {
        code: confirmation
      }
    };
    sgMail.send(msg);

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "otc not successful" });
  }
});

router.post("/reset-password", auth.optional, async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const passwordAgain = req.body.passwordAgain;
  const confirmation = req.body.confirmation;

  try {
    if (passwordAgain !== password) {
      return res.status(491).json({ message: "Password not matching" });
    }
    const otc = await OTC.findOne({ email: email });
    if (!otc.validateCmf(confirmation)) {
      return res
        .status(401)
        .json({ message: "The confirmation code is not valid" });
    }
    const user = await User.findOne({ email: email });
    if (!user) return res.status(404).json({ message: "User not exist" });

    if (user.validatePassword(password)) {
      return res.status(403).json({
        message: "Password Exist"
      });
    }

    user.setPassword(password);
    user.save();

    return res.json({ message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

//Append id of post to User likedposts database
router.post("/likes/:id", auth.required, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $addToSet: { likedPosts: req.body.postID } },
      { new: true }
    );

    if (!result)
      return res.status(400).json({ message: "Please register or sign in" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "error occurred" });
  }
});

router.delete("/likes/:id", auth.required, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { likedPosts: req.query.postID } },
      { new: true }
    );

    if (!result)
      return res.status(400).json({ message: "Please register or sign in" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "error occurred" });
  }
});

//Append id of post to User myPosts database
router.post("/myPosts/:id", auth.required, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $push: { myPosts: req.body.postID } },
      { new: true }
    );

    if (!result)
      return res.status(400).json({ message: "Please register or sign in" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "error occurred" });
  }
});

router.delete("/myPosts/:id", auth.required, async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.params.id },
      { $pull: { myPosts: req.query.postID } },
      { new: true }
    );

    if (!result)
      return res.status(400).json({ message: "Please register or sign in" });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "error occurred" });
  }
});

router.post("/login", (req, res) => {
  return passport.authenticate("local", { session: false }, function(
    err,
    user,
    info
  ) {
    if (err) {
      next(err);
    }
    if (info) {
      return res.status(468).json(new Error());
    }
    if (!user) {
      return res.status(458).json(new Error());
    }
    // if (!user.confirmed) {
    //   return res.status(478).json(new Error());
    // }
    return res.json(user.toAuthJSON());
  })(req, res);
});

module.exports = router;
