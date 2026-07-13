const express = require('express');
const { createTransaction, createInitialFundsTransaction } = require('../controllers/transaction.controller');
const { authSystemUserMiddleware, auth } = require('../middleware/auth.middleware');
const router = express.Router();




router.post("/", auth, createTransaction)
router.post("/system/initial-funds", authSystemUserMiddleware, createInitialFundsTransaction)

module.exports = router;
