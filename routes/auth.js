const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../keys");
const requirelogin = require("../middleware/requirelogin");
//Signup Route
router.post(
  "/signup",
  body("name").isLength({ min: 4 }),
  body("email").isEmail(),
  body("password").isAlphanumeric().isLength({ min: 4 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body.name);
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      res.status(422).json({ error: "Please Fill All the Fields" });
    }
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res
            .status(422)
            .json({ error: "User Already Exists with This Email!" });
        }
        bcrypt.hash(password, 12).then((hashedpass) => {
          const user = new User({
            name,
            email,
            password: hashedpass,
          });
          user
            .save()
            .then((user) => {
              res.json({ message: "User Saved Successfully" });
            })
            .catch((err) => {
              console.log(err);
            });
        });
        //res.status(200).json({ message: "Successfully Posted" });
      })
      .catch((err) => {
        console.log(err);
      });
  }
);
//Signin Route
router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(422)
      .json({ error: "Please Add Both Email and Password" });
  }
  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res.status(422).json({ error: "Invalid Email or password" });
    }
    bcrypt
      .compare(password, savedUser.password)
      .then((doMatch) => {
        if (doMatch) {
          const token = jwt.sign({ _id: savedUser._id }, JWT_KEY);
          res.json(token);
          console.log("successfully signed in");
        } else {
          return res.status(422).json({ error: "Invalid Email or password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
});
//Route to Demonstrate Working of Tokens and retrieve user info
//here id in params will be id of user in mongodb
router.get("/:id", requirelogin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc; // this will hide pass but will show other info
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
