const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../services/email.service");
const dotenv = require("dotenv");
const TokenBlackList = require("../models/blackList.model");
dotenv.config();

/**
 * - user register controller
 * - POST /api/v1/auth/register
 */

exports.userRegisterController = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const isExists = await User.findOne({ email });
    if (isExists) {
      return res.status(422).json({
        success: false,
        message: "User already exists with email",
      });
    }

    const user = await User.create({
      email,
      password,
      name,
    });

    const payload = {
      email: user.email,
      name: user.name,
      id: user._id,
    };

    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    sendRegistrationEmail(user.email, user.name);

    return res.cookie("authCookie", token, options).status(201).json({
      success: true,
      message: "Account Register Successfully",
      token: token,
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      error: err.message,
      success: false,
      message: "Something went false",
    });
  }
};

/**
 * - user Login controller
 * - POST /api/v1/auth/login
 */

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All feilds are mandatory",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email or password is invalid",
      });
    }

    const isValidPwd = await user.comparePassword(password);

    if (!isValidPwd) {
      return res.status(401).json({
        success: false,
        message: "Email or password is invalid ",
      });
    }
    const payload = {
      email: user.email,
      id: user._id,
    };
    let token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    return res
      .cookie("authCookie", token, options)
      .status(200)
      .json({
        success: true,
        message: "Login Successfully",
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
        },
        token: token,
      });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong",
    });
  }
};


exports.logoutController = async (req, res) => {
  try {

    const token = req.cookies.authCookie || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "User Logged Out Already",
      });
    }
    res.clearCookie("authCookie");

    await TokenBlackList.create({ token });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong while logging out",
    });
  }
}