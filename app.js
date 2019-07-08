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
app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
  })
);
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
