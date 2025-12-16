const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const verifyOTPValidationSchema = Joi.object({
  otp: Joi.string().required().messages({
    'string.empty': 'otp is required',
    'any.required': 'otp is required',
  }),
  contact: Joi.string().required().messages({
    'string.empty': 'contact is required',
    'any.required': 'contact is required',
  })
});

const verifyOTPValidation = (req, res, next) => {
  const { error } = verifyOTPValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 400);
  }
  next();
};

module.exports = { verifyOTPValidation };