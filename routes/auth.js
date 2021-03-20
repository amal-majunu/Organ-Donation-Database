require('dotenv').config();
const router = require("express").Router();
const authController = require("../controllers/auth");
const jwt = require("jsonwebtoken");


router.post("/loginad", authController.loginad);
router.post("/logind",  authController.logind);
router.post("/register", authController.register);
router.post("/details", authController.details);
router.post("/update", authController.update);
router.post("/delete", authController.delete);


module.exports = router;