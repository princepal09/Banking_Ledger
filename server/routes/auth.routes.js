const express = require("express")
const {userRegisterController, loginController} = require("../controllers/user.controller")

const router = express.Router();

/*  POST /api/v1/auth/register */
router.post("/auth/register", userRegisterController);

/*  POST /api/v1/auth/login  */
router.post("/auth/login", loginController)


module.exports = router;