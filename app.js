const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

require("./config/passport");
require("dotenv").config();

const DBPORT = process.env.DBPORT || 27017;
const PORT = process.env.PORT || 3000;

mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true
  })
  .then(() => console.log("connected"))
  .catch(error => console.error(error));

const allowedOrigins = ["http://localhost:3000", "http://yourapp.com"];
app = express();
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});
// app.use(cors());
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
app.use(function(err, req, res, next) {
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
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
