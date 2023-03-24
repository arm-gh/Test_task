//Middleware for Token Authentication
const jwt = require("jsonwebtoken");
const { JWT_KEY } = require("../keys");
const mongoose = require("mongoose");
const User = mongoose.model("User");
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    res.status(401).json({ error: "You Must be Logged in" });
  }
  const token = authorization.replace("Bearer ", "");
  console.log("Token=", token);
  jwt.verify(token, JWT_KEY, (err, payload) => {
    if (err) {
      return res.status(401).json({ error: "You Must be Logged in" });
    }
    const { _id } = payload;
    User.findById(_id).then((userdata) => {
      req.user = userdata;
      next();
    });
  });
};
