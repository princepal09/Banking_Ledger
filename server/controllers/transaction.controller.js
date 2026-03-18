const Transaction = require("../models/transaction.model");
const Ledger = require("../models/transaction.model");
const Account = require("../models/account.model");
const mongoose = require('mongoose')
const emailService = reqiure("../services/email.service.js")
exports.createTransaction = async (req, res) => {
  /**
   * 1. Validate Request
   */

  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      status: false,
      message: "all fields are mandatory !!",
    });
  }

  const fromUserAccount = await Account.findOne({ _id: toAccount });
  const toUserAccount = await Account.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      status: false,
      message: "Invalid fromAccount or toAccount",
    });
  }

  /**
   * 2. Validate Idempotency Key
   */

  const isTransactionAlreadyExists = await Transaction.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status == "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already proceesed",
        transaction : isTransactionAlreadyExists
      });
    }
    if (isTransactionAlreadyExists.status == "PENDING") {
      return res.status(200).json({
        message: "MESSAGE transaction  is still in Processing",
      });
    }
    if (isTransactionAlreadyExists.status == "FAILED") {
      return res.status(500).json({
        success: false,
        message: "Transaction processing failed",
      });
    }
    if (isTransactionAlreadyExists.status == "REVERSED") {
      return res.status(500).json({
        success: false,
        message: "Transaction was reversed, Please retry ",
      });
    }
  }

  /**
   * 3. Check Account Status
   */

  if(fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== "ACTIVE"){
    return res.status(400).json({
        success : false,
        message : "Both fromAccount and toUserAccount must be ACTIVE to process transaction"

    })
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance =  await fromUserAccount.getBalance()
  if(balance < amount){
    return res.status(400).json({
      success : false,
      message : `Insufficient balance. Current balance is ${balance}, Requested amount is ${amount}`
    })
  }

  /**
   * 5. Create Transaction (PENDING)
   */
  const session = await mongoose.startSession();
  session.startTransaction();
  
  const transaction = await transactionModel.create({
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
    status : "PENDING",

  }, {session})

   const debitLedgerEntry = await ledgerModel.create({
    account : toAccount,
    amount : amount,
    transaction : transaction._id,
    type : "DEBIT",


  }, {session})

  const creditLedgerEntry = await ledgerModel.create({
    account : toAccount,
    amount : amount,
    transaction : transaction._id,
    type : "CREDIT",


  }, {session})

  transaction.status = "COMPLETED"
  await transaction.save({session})

  await session.commitTransaction();
  session.endSession();

  /**
   * 10. Send email notifications
   */

  await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

  return res.status(200).json({
    success : true,
    message : "Transaction processed successfully",
    transaction : transaction
  })

};
