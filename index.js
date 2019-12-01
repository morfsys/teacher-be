const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var cors = require('cors');

const app = express();
const http = require("http").Server(app);

// CORS
app.use(cors());

// Using api default route
app.use(
    "/api/v1",
    bodyParser.urlencoded({ extended: true }),
    bodyParser.json(),
    require("./routes")
);

// mongoose connect
mongoose
    .connect(require("./config").url, {
        useNewUrlParser: true
    })
    .then(() => {
        console.log("Successfully connected");
    })
    .catch(err => {
        console.log("Failed to connect to mongodb", err.message);
        process.exit();
    });

http.listen(3001, () => {
    console.log("Server is listening");
});