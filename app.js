const express = require("express");
const app = express();
const PORT = 3000;
const mongoose = require("mongoose");
const { MONGOURL } = require("./keys");

require("./models/user");
app.use(express.json());
app.use(require("./routes/auth"));

mongoose.connect(MONGOURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("Successfully Connected to Mongo DB");
});

mongoose.connection.on("error", (err) => {
  console.log("Connection Failed to Mongo DB", err);
});

app.listen(PORT, () => {
  console.log("server is running on ", PORT);
});
