const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');

const registerUserValidationSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'name is required',
    'any.required': 'name is required',
    'string.min': 'name should have a minimum length of 2',
    'string.max': 'name should have a maximum length of 50',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'email is required',
    'any.required': 'email is required',
    'string.email': 'email must be a valid email',
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
  next();
};

module.exports = { registerValidation };