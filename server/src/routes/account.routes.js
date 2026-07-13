const express = require("express")
const {auth} = require("../middleware/auth.middleware")
const router = express.Router();
const {accountController} = require("../controllers/account.controller")


/**
 *  - POST /api/accounts/
 *  - CREATE a new account
 *  - Protected Route
 */

  router.post("/", auth, accountController);



module.exports = router;