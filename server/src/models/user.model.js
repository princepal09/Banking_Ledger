const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required for creating a url"],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
      unique: [true, "Email already exists"],
    },
    name: {
      type: String,
      required: [true, "Name is required for creating a account"],
    },
    password: {
      type: String,
      required: [true, "Password is required for creating an account"],
      minlength: [6, "password should contain more than 6 character"],
      select: false,
    },
    systemUser : {
      type : Boolean,
      default : false,
      immutable : false,
      select : false
    } 
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
