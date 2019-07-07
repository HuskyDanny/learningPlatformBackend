const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
require("./config/passport");
require("dotenv").config();

const DBPORT = process.env.DBPORT || 27017;
const APIPORT = process.env.APIPORT || 3000;

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect("mongodb://localhost:" + DBPORT + "/project", {
    useNewUrlParser: true
  })
  .then(() => console.log("connected"))
  .catch(error => console.error(error));

app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));
app.use(
  session({
    secret: "nowaytocheatonthisdouchybag",
    resave: true,
    saveUninitialized: true
  })
);
app.use(require("./routes"));
//Error handling middleware
app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(403).send({
      success: false,
      message: "Token is Incorrect"
    });
  }
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

var filesDir = path.join(path.dirname(require.main.filename), "uploads");
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir);
}

//Listening port
app.listen(APIPORT, () => {
  console.log(`Listening on ${APIPORT}`);
});
