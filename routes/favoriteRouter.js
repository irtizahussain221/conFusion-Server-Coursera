const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const Favorites = require("../models/favorites");
const cors = require("./cors");

const favoritesRouter = express.Router();

favoritesRouter.use(bodyParser.json());

favoritesRouter
  .route("/")
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then((favorites) => {
        res.status = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorites) => {
        if (!favorites[0]) {
          Favorites.create({ user: req.user._id, dishes: req.body })
            .then((favorite) => {
              res.status = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((e) => next(e));
        } else {
          for (var i = 0; i < req.body.length; i++) {
            if (favorites.dishes.indexOf(req.body[i]._id) === -1) {
              favorites.dishes.push(req.body[i]._id);
            }
          }
          favorites
            .save()
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorites);
            })
            .catch((e) => next(e));
        }
      })
      .catch((e) => next(e));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status = 403;
    res.end("Put operations not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(() => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ status: "Delete operation successfull!" });
      })
      .catch((err) => next(err));
  });

favoritesRouter
  .route("/:dishId")
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Get operation not supported on this route!");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite[0]) {
          Favorites.create({
            user: req.user._id,
            dishes: [req.params.dishId],
          })
            .then((favorites) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ favorites, createStatus: "Successfull" });
            })
            .catch((e) => next(e));
        } else {
          if (favorite.dishes.indexOf(req.params.dishId) === -1) {
            favorite.dishes.push(req.params.dishId);
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((e) => next(e));
          }
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not supported on this route!");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then((favorite) => {
        if (!favorite[0]) {
          let err = new Error("No favorites present!");
          err.status = 404;
          return next(err);
        } else {
          index = favorite.dishes.indexOf(req.params.dishId);
          if (index >= 0) {
            favorite.dishes.splice(index, 1);
            favorite
              .save()
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              })
              .catch((e) => next(e));
          } else {
            let err = new Error("DISH NOT PRESENT");
            err.status = 404;
            return next(err);
          }
        }
      })
      .catch((e) => next(e));
  });
module.exports = favoritesRouter;
