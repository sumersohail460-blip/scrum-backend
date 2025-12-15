const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

/**************************
 * Get current token user
 **************************/
exports.getCurrentUser = (token) => {
  try {
    if (!token) {
      throw new Error("Token is required");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.user;
  } catch (error) {
    console.error("Error decoding token:", error.message);
    throw new Error("Invalid or expired token");
  }
};

/**************************
 * Get current token
 **************************/
exports.getTokenFromRequest = (req) => {
  const token = req.headers.authorization?.split(" ")[1];
  return token;
};

//***************************
// Function to generate the access token
//***************************
exports.generateUserJwtToken = async (user) => {
  const payload = {
    user: {
      userId: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };

  let $token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "1d",
  });
  return $token;
};

//***************************
// Function to generate the refresh token
//***************************
exports.generateUserRefreshToken = async (user) => {
  const payload = {
    user: {
      userId: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
  });
  return refreshToken;
};

//***************************
// Function to generate both tokens
//***************************
exports.generateTokens = (user) => {
  const accessToken = this.generateUserJwtToken(user);
  const refreshToken = this.generateUserRefreshToken(user);

  return { accessToken, refreshToken };
};

//***************************
// Function to get Logged in User
//***************************
exports.getLoggedInUser = (req) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Bearer <token>;
  // 2. Verify and decode the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  return decoded.user; // Assuming user details are stored in 'user' payload
};

//***************************
// Function to hash password
//***************************
exports.hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

//***************************
// Function to compare password
//***************************
exports.comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};