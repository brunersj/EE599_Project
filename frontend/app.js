const express = require("express");
const app = express();
const axios = require('axios');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

let port = 3000;
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(port, err => {
  console.log(`Listening on port: ${port}`);
});
