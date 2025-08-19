const jwt = require("jsonwebtoken");
require('dotenv').config();

const Validate = async (req, res, next) => {
 
  try {
    const token =req.cookies.babbarCookie 

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }


    const decoded = jwt.verify(token, process.env.jwt_secret);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }


    req.id = decoded;    
    next();
  }catch (error) {
  
    if (error.name === "TokenExpiredError") {
         return res.status(401).json({
        success: false,
        message: "Token expired, please login again",
      });
    }

    if (error.name === "JsonWebTokenError") {
         return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      Error: error.message,
    });
  }
};



module.exports = Validate;
