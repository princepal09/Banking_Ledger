const express = require("express")
const {auth} = require("../middleware/auth.middleware")
const router = express.Router();
const {createAccountController, getUserAccountsController, getAccountBalanceController } = require("../controllers/account.controller")


/**
 *  - POST /api/accounts/
 *  - CREATE a new account
 *  - Protected Route
 */

  router.post("/create", auth, createAccountController);
  router.get("/getUserAccounts", auth, getUserAccountsController);
  router.get("/getAccountBalance/:accountId", auth, getAccountBalanceController);

  


module.exports = router;