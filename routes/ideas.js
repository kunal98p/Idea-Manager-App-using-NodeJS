const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { ensureAuthenticated } = require("../helpers/auth");

//Load Idea model
require("../models/Idea");
const Idea = mongoose.model("ideas");

//ideas Index Page
router.get("/", ensureAuthenticated, (req, res) => {
  Idea.find({ user: req.user.id })
    .sort({ date: "desc" })
    .then(ideas => {
      res.render("ideas/index", {
        ideas: ideas
      });
    });
});

//Edit Idea Form
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    if (idea.user != req.user.id) {
      req.flash("error_msg", "Not Authorized");
      res.redirect("/ideas");
    } else {
      res.render("ideas/edit", {
        idea: idea
      });
    }
  });
});

//Add Ideas Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("ideas/add");
});

//process Form
router.post("/", ensureAuthenticated, (req, res) => {
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please Add a Title" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please Add some details" });
  }

  if (errors.length > 0) {
    res.render("ideas/add", {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details,
      user: req.user.id
    };
    new Idea(newUser)
      .save()
      .then(idea => {
        req.flash("success_msg", "Project Idea Added");
        res.redirect("/ideas");
      })
      .catch(err => {
        res.send(err);
      });
  }
});

//Edit Form process
router.put("/:id", ensureAuthenticated, (req, res) => {
  Idea.findOne({
    _id: req.params.id
  }).then(idea => {
    idea.title = req.body.title;
    idea.details = req.body.details;
    idea
      .save()
      .then(idea => {
        req.flash("success_msg", "Project Idea Updated");
        res.redirect("/ideas");
      })
      .catch(err => {
        console.log(err);
      });
  });
});

//Delete Idea
router.delete("/:id", ensureAuthenticated, (req, res) => {
  Idea.deleteOne({ _id: req.params.id })
    .then(idea => {
      req.flash("success_msg", "Project Idea Removed");
      res.redirect("/ideas");
    })
    .catch(err => {
      res.send(err);
    });
});

module.exports = router;
