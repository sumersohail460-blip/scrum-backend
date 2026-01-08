const jwt = require("jsonwebtoken");
const prisma = require("../config/dbConfig");
require("dotenv").config();

const optionalAuthMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>

  if (!token) {
    // No token provided, continue without user info
    req.user = null;
    return next();
  }

  try {
    // Check if token is blacklisted
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    });
    
    if (blacklisted) {
      req.user = null;
      return next();
    }

    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Attach user to request
    req.token = token; // Attach token to request
    next();
  } catch (error) {
    // Token invalid, continue without user info
    req.user = null;
    next();
  }
};

module.exports = optionalAuthMiddleware;