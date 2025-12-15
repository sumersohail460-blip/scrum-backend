const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');
const { detectContactType } = require('../helpers/contactHelper');

const loginUserValidationSchema = Joi.object({
  contact: Joi.string().required().messages({
    'string.empty': 'email or phone is required',
    'any.required': 'email or phone is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'password is required',
    'any.required': 'password is required',
  })
});

const loginValidation = (req, res, next) => {
  const { error } = loginUserValidationSchema.validate(req.body);
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

module.exports = { loginValidation };