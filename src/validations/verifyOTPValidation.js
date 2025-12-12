const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const verifyOTPValidationSchema = Joi.object({
  contact: Joi.string().required().messages({
    'string.empty': 'email or phone is required',
    'any.required': 'email or phone is required',
  }),
  email: Joi.string().optional(), // For backward compatibility
  otp: Joi.string().required().messages({
    'string.empty': 'otp is required',
    'any.required': 'otp is required',
  }),
  type: Joi.string().valid('EMAIL_VERIFICATION', 'PASSWORD_RESET').default('EMAIL_VERIFICATION')
});

const verifyOTPValidation = (req, res, next) => {
  const { error } = verifyOTPValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }

  // Support both 'contact' and 'email' for backward compatibility
  const contactToVerify = req.body.contact || req.body.email;
  if (!contactToVerify) {
    return responseHandler.errorResponse(res, 'email or phone is required', 422);
  }

  // Validate contact type
  const contactType = detectContactType(contactToVerify);
  if (!contactType) {
    return responseHandler.errorResponse(res, 'Please provide a valid email or phone number', 422);
  }

  req.body.contactType = contactType;
  next();
};

module.exports = { verifyOTPValidation };