const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
  try {
    const token = req.cookies || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        succcess: false,
        message: "Token Missing !!!",
      });
    }

    // Verify the token
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      req.user = user;
      next();
    } catch (err) {
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
