const express = require('express');
const { createTransaction } = require('../controllers/transaction.controller');
const router = express.Router();
const {auth} = require("../middlewares/auth.middleware")




router.post("/", auth, createTransaction)

module.exports = router;
