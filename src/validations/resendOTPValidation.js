const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const resendOTPValidationSchema = Joi.object({
  contact: Joi.string().required().messages({
    'string.empty': 'email or phone is required',
    'any.required': 'email or phone is required',
  }),
  type: Joi.string().valid('EMAIL_VERIFICATION', 'PASSWORD_RESET').default('EMAIL_VERIFICATION')
});

const resendOTPValidation = (req, res, next) => {
  const { error } = resendOTPValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }

  // Validate contact type
  const contactType = detectContactType(req.body.contact);
  if (!contactType) {
    return responseHandler.errorResponse(res, 'Please provide a valid email or phone number', 422);
  }

  req.body.contactType = contactType;
  next();
};

module.exports = { resendOTPValidation };