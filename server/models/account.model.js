const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account Must be associated with a user"],
    },
    status: {
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE, FROZEN OR CLOSED",
      },
    },
    currency: {
      type: String,
      required: [true, "Currency is required for creating an account"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Account", accountSchema)
