const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan")
require('dotenv').config()
const Main = require("./routes");

const app = express();

app.use(cors());
app.use(morgan("tiny"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/", Main)

app.listen(process.env.PORT || 3030, () => {
    console.log('App Running');
});

