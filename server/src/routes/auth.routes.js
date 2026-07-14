const express = require("express")
const {userRegisterController, loginController} = require("../controllers/user.controller")

const router = express.Router();

/*  POST /api/v1/auth/register */
router.post("/register", userRegisterController);


router.post("/logout", auth, logoutController)

/*  POST /api/v1/auth/login  */
router.post("/login", loginController)


module.exports = router;