const mongoose = require("mongoose")

const ledgerSchema = new mongoose.Schema({
    account : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Account",
        required : [true, "Ledger must be associated with an account"],
        index : true,
        immutable : true
    },
    amount : {
        type : Number,
        required : [true, "Amount is required for creating  a ledger entry"],
        immutable : true
    },
    transaction : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Transaction",
        required : [true, "Ledger must be associated with a transaction"],
        index : true,
        immutable : true
    },
    type : {
        type : String,
        enum : {
            values : ["CREDIT", "DEBIT"],
            message : "Type Can be either CREDIT OR DEBIT"
        },
        required : [true, "Ledger type is required"],
        immutable : true
    }
})

function preventLedgaModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or deleted")

}

ledgerSchema.pre('findOneAndUpdate', preventLedgaModification)
ledgerSchema.pre('updateOne', preventLedgaModification)
ledgerSchema.pre('deleteOne', preventLedgaModification)
ledgerSchema.pre('remove', preventLedgaModification)
ledgerSchema.pre('deleteMany', preventLedgaModification)


module.exports = mongoose.model("Ledger", ledgerSchema)