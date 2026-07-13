const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const User = require("../models/user.model");
const Account = require("../models/account.model");
const mongoose = require('mongoose')
const emailService = require("../services/email.service.js")


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

  const fromUserAccount = await Account.findOne({ _id: fromAccount });
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
        transaction: isTransactionAlreadyExists
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

  if (fromUserAccount.status !== 'ACTIVE' || toUserAccount.status !== "ACTIVE") {
    return res.status(400).json({
      success: false,
      message: "Both fromAccount and toUserAccount must be ACTIVE to process transaction"

    })
  }

  /**
   * 4. Derive sender balance from ledger
   */

  const balance = await fromUserAccount.getBalance()
  if (balance < amount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Current balance is ${balance}, Requested amount is ${amount}`
    })
  }

    let transaction;

    try {


        /**
         * 5. Create transaction (PENDING)
         */
        const session = await mongoose.startSession()
        session.startTransaction()

        transaction = (await Transaction.create([ {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        } ], { session }))[ 0 ]

        const debitLedgerEntry = await Ledger.create([ {
            account: fromAccount,
            amount: amount,
            transaction: transaction._id,
            type: "DEBIT"
        } ], { session })

        // await (() => {
        //     return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
        // })()

          const creditLedgerEntry = await Ledger.create([ {
            account: toAccount,
            amount: amount,
            transaction: transaction._id,
            type: "CREDIT"
        } ], { session })

        await Transaction.findOneAndUpdate(
            { _id: transaction._id },
            { status: "COMPLETED" },
            { session }
        )


        await session.commitTransaction()
        session.endSession()
    } catch (error) {
      console.error("Error processing transaction:", error);

        return res.status(400).json({
            message: "Transaction is Pending due to some issue, please retry after sometime",
        })

    }
    /**
     * 10. Send email notification
     */
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount)

    return res.status(201).json({
        message: "Transaction completed successfully",
        transaction: transaction
    })

}



exports.createInitialFundsTransaction = async (req, res) => {

  try {

    const { toAccount, amount, idempotencyKey } = req.body;


    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "toAccount, amount and idempotencyKey are mandatory"
      })
    }
    const toUserAccount = await Account.findOne({ _id: toAccount });
    if (!toUserAccount) {
      return res.status(400).json({
        success: false,
        message: "Invalid toAccount"
      })
    }

    const fromUserAccount = await Account.findOne({
      user: req.user._id
    })

    if (!fromUserAccount) {
      return res.status(400).json({
        success: false,
        message: "No system user account found for the current user"
      })
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new Transaction({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
    })

    console.log(transaction.toObject());

    const debitLedgerEntry = await Ledger.create([{
      account: fromUserAccount._id,
      amount,
      transaction: transaction._id,
      type: "DEBIT"
    }], { session })

    const creditLedgerEntry = await Ledger.create([{
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "CREDIT"
    }], { session })


    transaction.status = "COMPLETED"
    await transaction.save({ session })


    await session.commitTransaction();
    session.endSession();


    return res.status(201).json({
      success: true,
      message: "Initial funds transaction created successfully",
      transaction: transaction
    })

  } catch (err) {
    console.error(err);
    console.error(err.stack);
    return res.status(500).json({
      success: false,
      message: "Error processing initial funds transaction",
      error: err.message
    })
  }
}