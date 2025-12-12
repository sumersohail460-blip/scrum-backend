const Joi = require('joi');

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

const updatePasswordValidation = (req, res, next) => {
  const { error } = updatePasswordSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = { updatePasswordValidation };