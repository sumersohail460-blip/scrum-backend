const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const registerUserValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'name is required',
    'any.required': 'name is required',
    'string.min': 'name should have a minimum length of 2',
    'string.max': 'name should have a maximum length of 50',
  }),
  contact: Joi.string().required().messages({
    'string.empty': 'email or phone is required',
    'any.required': 'email or phone is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.empty': 'password is required',
    'any.required': 'password is required',
    'string.min': 'password should have a minimum length of 8',
  })
});

const registerValidation = (req, res, next) => {
  const { error } = registerUserValidationSchema.validate(req.body);
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

module.exports = { registerValidation };