const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');

const forgotPasswordValidationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'email is required',
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
  })
});

const forgotPasswordValidation = (req, res, next) => {
  const { error } = forgotPasswordValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }
  next();
};

module.exports = { forgotPasswordValidation };