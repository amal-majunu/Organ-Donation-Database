//jshint esversion:6
const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/",(req,res)=>{
    res.render("index");
});

app.listen(3000, function(){
    console.log('Server started at port 3000');
});

