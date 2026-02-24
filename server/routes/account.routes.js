const express = require("express")
const {auth} = require("../middleware/auth.middleware")
const router = express.Router();


/**
 *  - POST /api/accounts/
 *  - CREATE a new account
 *  - Protected Route
 */

  router.post("/", auth, );



module.exports = router;