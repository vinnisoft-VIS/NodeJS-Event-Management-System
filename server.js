require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const app = express();
const http = require("http");
var cors = require("cors");
var bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const port = process.env.APP_PORT;
const httpServer = http.createServer(app);

httpServer.listen(port, () => {
  console.log("server up and running on PORT :", port);
});
