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
  router.post("/getUserAccounts", auth, getUserAccountsController);
  router.post("/getAccountBalance/:accountId", auth, getAccountBalanceController);

  


module.exports = router;