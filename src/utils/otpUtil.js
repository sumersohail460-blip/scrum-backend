const generalHelper = require('../helpers/generalHelper');

const generateOTP = () => {
  return generalHelper.generateOTP();
};

const isOTPExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

const createExpiryTime = (minutes) => {
  return generalHelper.createExpiryTime(minutes);
};

module.exports = { generateOTP, isOTPExpired, createExpiryTime };