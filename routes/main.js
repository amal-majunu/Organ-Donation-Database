require('dotenv').config();
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const authenticateToken = require("../middleware/auth");

router.get("/", (req,res)=>{
    res.render("index");
});

router.get("/logind", (req,res)=>{
    res.render("logind", {message:''});
});

router.get("/register", (req,res)=>{
    res.render("register", {message:''});
});

router.get("/loginad", (req,res)=>{
    res.render("logina", {message:''});
});

router.get("/admin", authenticateToken, (req,res) => {
    console.log(req.user);
    if(req.user){
        res.render("admin", {mu : '', md : '', mo : ''});
    }else {
        res.render("logina",{
            message : 'Login first' 
        }); 
    }
});

router.get("/donorfillup", authenticateToken, (req,res) => {
    console.log(req.user);
    res.render("donorfillup", {message:''});
});

router.get("/logout",authenticateToken, async (req,res) => {
    try {
        res.clearCookie("jwt");
        console.log("successfully logged out");
        res.redirect("/");
              
    } catch (err) {
        console.log(err);       
    }    
});




module.exports = router;