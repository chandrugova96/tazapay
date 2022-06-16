const express = require('express');
const http = require("http");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const PORT = process.env.PORT || 4200;
const app = express();
const server = http.createServer(app);
app.use(bodyParser.json({ limit: "3000mb" }));
app.use(bodyParser.urlencoded({ limit: "3000mb", extended: true }));

app.use("/payment", require("./router/payment.route"));

mongoose.connect('mongodb://localhost:27017/tazapay');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("DB connected successfully");
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
});