const jwt = require("jsonwebtoken");
const prisma = require("../config/dbConfig");
const { errorResponse } = require("../utils/apiResponseUtil");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>

  if (!token) {
    return errorResponse(res, "Access denied. No token provided.", 401);
  }

  try {
    // Check if token is blacklisted
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    });
    
    if (blacklisted) {
      return errorResponse(res, "Token has been revoked.", 401);
    }

    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user to request
    req.token = token; // Attach token to request for logout
    next();
  } catch (error) {
    // Handle expired token
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired.", 401);
    }

    // Handle other token verification errors
    return errorResponse(res, "Unauthorized access.", 401);
  }
};

module.exports = authMiddleware;