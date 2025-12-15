const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const resetPasswordValidationSchema = Joi.object({
  contact: Joi.string().required().messages({
    'string.empty': 'email or phone is required',
    'any.required': 'email or phone is required',
  }),
  email: Joi.string().optional(), // For backward compatibility
  password: Joi.string().min(8).required().messages({
    'string.empty': 'password is required',
    'any.required': 'password is required',
    'string.min': 'password should have a minimum length of 8',
  })
});

const resetPasswordValidation = (req, res, next) => {
  const { error } = resetPasswordValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }

  // Support both 'contact' and 'email' for backward compatibility
  const contactToReset = req.body.contact || req.body.email;
  if (!contactToReset) {
    return responseHandler.errorResponse(res, 'email or phone is required', 422);
  }

  // Validate contact type
  const contactType = detectContactType(contactToReset);
  if (!contactType) {
    return responseHandler.errorResponse(res, 'Please provide a valid email or phone number', 422);
  }

  req.body.contactType = contactType;
  next();
};

module.exports = { resetPasswordValidation };