const { Router } = require("express");
const sgMail = require("../../../config/sgMail");

router = Router();

router.post("/", async (req, res) => {
  const { email, content } = req.body;

  const msg = {
    to: "junchenp1018@gmail.com",
    from: email,
    subject: "Welcome to TechLeak, Enjoy Learning",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>" + content + "</strong>"
  };
  await sgMail.send(msg);
  res.json(msg);
});

module.exports = router;
