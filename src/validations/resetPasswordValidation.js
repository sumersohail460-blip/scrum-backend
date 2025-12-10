const Joi = require('joi');
const responseHandler = require('../utils/apiResponseUtil');

const resetPasswordValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const resetPasswordValidation = (req, res, next) => {
  const { error } = resetPasswordValidationSchema.validate(req.body);
  if (error) {
    return responseHandler.errorResponse(res, error.details[0].message, 422);
  }
  next();
};

module.exports = { resetPasswordValidation };