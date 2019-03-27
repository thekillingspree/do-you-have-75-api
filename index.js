const express = require("express");
const bodyParser = require("body-parser");

const Main = require("./routes");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use("/attendance", Main)

app.listen(process.env.PORT | 3000, () => {
    console.log('App Running');
});

