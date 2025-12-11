const Joi = require('joi');

const socialLoginSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  authMethod: Joi.string().valid('Google', 'Facebook').required(),
  socialId: Joi.string().required(),
  fcmToken: Joi.string().optional()
});

const socialLoginValidation = (req, res, next) => {
  const { error } = socialLoginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = { socialLoginValidation };