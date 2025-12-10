const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');

const verifyOTPValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  type: Joi.string().valid('EMAIL_VERIFICATION', 'PASSWORD_RESET').default('EMAIL_VERIFICATION')
});

const verifyOTPValidation = (req, res, next) => {
  const { error } = verifyOTPValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }
  next();
};

module.exports = { verifyOTPValidation };