const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies.authCookie || req.headers.authorization?.split(" ")[1];
    console.log("Token from cookies or headers:", token);
    if (!token) {
      return res.status(401).json({
        succcess: false,
        message: "Token Missing !!!",
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      req.user = user;
      return next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
};

exports.authSystemUserMiddleware = async(req, res, next) => {
  try {
    const token = req.cookies.authCookie || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        succcess: false,
        message: "Token Missing !!!",
      });
    }


    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("+systemUser")
      
      if (!user.systemUser) {
        return res.status(403).json({
          success: false,
          message: "Forbidden access, not a system user"
        })
      }

      req.user = user;

      return next();
    } catch (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }


  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
}