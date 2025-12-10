const bcrypt = require("bcrypt");
const crypto = require("crypto");

class generalHelper {
  // Generate encrypted password
  static async encryptPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Generate a random 6-digit OTP
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static createExpiryTime(value) {
    return new Date(Date.now() + value * 60 * 1000);
  }

  static getOtpChunk(otp, index) {
    otp = String(otp); // Ensure otp is a string

    if (index < 1 || index > otp.length) {
      throw new Error("Index out of range");
    }
    return otp.charAt(index - 1); // Convert 1-based index to 0-based
  }

  // Generate random string
  static generateRandomString(length = 10) {
    return crypto.randomBytes(length).toString("hex").substring(0, length);
  }

  // Check if email is valid
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Format date to readable string
  static formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

module.exports = generalHelper;