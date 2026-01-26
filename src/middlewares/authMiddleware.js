const jwt = require("jsonwebtoken");
const prisma = require("../config/dbConfig");
const { errorResponse } = require("../utils/apiResponseUtil");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  console.log('=== Auth Middleware ===');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Authorization Header:', req.header("Authorization"));
  
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>

  if (!token) {
    console.log('No token provided');
    return errorResponse(res, "Access denied. No token provided.", 401);
  }

  console.log('Token found:', token.substring(0, 20) + '...');

  try {
    // Check if token is blacklisted
    const blacklisted = await prisma.blacklistedToken.findUnique({
      where: { token }
    });
    
    if (blacklisted) {
      console.log('Token is blacklisted');
      return errorResponse(res, "Token has been revoked.", 401);
    }

    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
    req.user = decoded.user; // Attach user to request
    req.token = token; // Attach token to request for logout
    
    console.log('User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    // Handle expired token
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, "Token has expired.", 401);
    }

    // Handle other token verification errors
    return errorResponse(res, "Unauthorized access.", 401);
  }
};

module.exports = authMiddleware;