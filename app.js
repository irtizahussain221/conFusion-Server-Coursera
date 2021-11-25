const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const dishRouter = require("./routes/dishRouter");
const promoRouter = require("./routes/promoRouter");
const leaderRouter = require("./routes/leaderRouter");
const session = require("express-session");
const FileStore = require("session-file-store")(session);

const app = express();

const url = "mongodb://localhost:27017/conFusion";
const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("Connected correctly to server");
  },
  (err) => {
    console.log(err);
  }
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser("123457891011"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    name: "session-id",
    secret: "12345-6789-05115-558844",
    saveUninitialized: false,
    resave: false,
    store: new FileStore(),
  })
);

function auth(req, res, next) {
  console.log(req.session);

  if (!req.session.user) {
    let authHeader = req.headers.authorization;
    if (!authHeader) {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err);
      return;
    }
    var auth = new Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    var user = auth[0];
    var pass = auth[1];
    if (user === "admin" && pass === "password") {
      req.session.user = "admin";
      next();
    } else {
      let err = new Error("You are not authenticated!");
      res.setHeader("WWW-Authenticate", "Basic");
      err.status = 401;
      next(err);
    }
  } else {
    if (req.session.user === "admin") {
      console.log("req.session: ", req.session);
      next();
    } else {
      let err = new Error("You are not authenticated!");
      err.status = 401;
      next(err);
    }
  }
}

app.use(auth);

app.use("/dishes", dishRouter);
app.use("/promotions", promoRouter);
app.use("/leaders", leaderRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
