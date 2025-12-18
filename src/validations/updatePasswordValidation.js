const Joi = require('joi');

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6).required()
});

const updatePasswordValidation = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  
  const missing = [];
  if (!currentPassword) missing.push('currentPassword');
  if (!newPassword) missing.push('newPassword');
  
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} required`
    });
  }
  
  if (currentPassword && currentPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'currentPassword must be at least 6 characters long'
    });
  }
  
  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'newPassword must be at least 6 characters long'
    });
  }
  
  next();
};

module.exports = { updatePasswordValidation };