require('dotenv').config();
const router = require("express").Router();
const authController = require("../controllers/auth");
const authenticateToken = require("../middleware/auth");
const jwt = require("jsonwebtoken");


router.post("/loginad", authController.loginad);
router.post("/logind",  authController.logind);
router.post("/register", authController.register);
router.post("/details", authenticateToken, authController.details);
router.post("/update", authenticateToken, authController.update);
router.post("/delete", authenticateToken, authController.delete);
router.post("/dupdate", authenticateToken, authController.dupdate);
router.post("/withdraw", authenticateToken, authController.withdraw);


module.exports = router;